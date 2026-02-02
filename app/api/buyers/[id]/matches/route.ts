import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

/**
 * Calculate match score and details for buyer-seller pair
 */
function calculateMatch(buyer: any, seller: any, distanceKm: number) {
  const matchDetails: any = {
    location: false,
    budget: false,
    bedrooms: false,
    propertyType: false,
    lookingFor: false,
    furnishing: false,
  };

  let score = 0;
  const maxScore = 6;

  // 1. Location
  const radius = buyer.radius_km != null ? Number(buyer.radius_km) : 5;
  if (!isNaN(distanceKm) && distanceKm <= radius) {
    score += 1;
    matchDetails.location = true;
  }

  // 2. Budget
  const bmin = buyer.budget_min != null ? Number(buyer.budget_min) : null;
  const bmax = buyer.budget_max != null ? Number(buyer.budget_max) : null;
  if (bmin != null && bmax != null && seller.price != null) {
    if (Number(seller.price) >= bmin && Number(seller.price) <= bmax) {
      score += 1;
      matchDetails.budget = true;
    }
  }

  // 3. Bedrooms
  if (buyer.bedrooms && seller.bedrooms && Number(buyer.bedrooms) === Number(seller.bedrooms)) {
    score += 1;
    matchDetails.bedrooms = true;
  }

  // 4. Property type
  if (buyer.requirement && seller.property_type) {
    if ((String(buyer.requirement).toLowerCase()).includes(String(seller.property_type).toLowerCase())) {
      score += 1;
      matchDetails.propertyType = true;
    }
  }

  // ✅ 5. Looking For (BUY/RENT) - FIXED
  if (buyer.looking_for && seller.looking_for) {
    const buyerLF = String(buyer.looking_for).toUpperCase();
    const sellerLF = String(seller.looking_for).toUpperCase();

    // BUY ↔ SELL matching
    if (buyerLF === "BUY" && sellerLF === "SELL") {
      score += 1;
      matchDetails.lookingFor = true;
    }

    // RENT ↔ RENT matching
    if (buyerLF === "RENT" && sellerLF === "RENT") {
      score += 1;
      matchDetails.lookingFor = true;
    }
  }

  // 6. Furnishing - both tables use 'furnishing_preference'
  if (buyer.furnishing_preference && seller.furnishing_preference) {
    const buyerFurnishing = String(buyer.furnishing_preference).toUpperCase();
    const sellerFurnishing = String(seller.furnishing_preference).toUpperCase();
    
    const normalizeFurnishing = (val: string) => val.replace(/[-_\s]/g, '');
    
    if (normalizeFurnishing(buyerFurnishing) === normalizeFurnishing(sellerFurnishing)) {
      score += 1;
      matchDetails.furnishing = true;
    }
  }

  const percentage = Math.round((score / maxScore) * 100);

  return { score, maxScore, percentage, matchDetails };
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const buyerId = Number(id);

  const tenantId =
    Number(req.headers.get("x-tenant-id")) ||
    Number(req.nextUrl.searchParams.get("tenantId"));

  if (!buyerId || !tenantId) {
    return NextResponse.json({ matches: [] });
  }

  const conn = await pool.getConnection();

  try {
    // 1️⃣ Fetch buyer
    const [buyers]: any = await conn.execute(
      `
      SELECT
        id,
        budget_min,
        budget_max,
        bedrooms,
        lat,
        lng,
        radius_km,
        requirement,
        looking_for,
        furnishing_preference
      FROM buyers
      WHERE id = ? AND tenant_id = ? AND is_deleted = 0
      `,
      [buyerId, tenantId]
    );

    if (!buyers.length) {
      return NextResponse.json({ matches: [] });
    }

    const buyer = buyers[0];

    // 2️⃣ Fetch sellers - using correct column names
    const [rows]: any = await conn.execute(
      `
      SELECT
        s.id,
        s.property_type,
        s.price,
        s.bedrooms,
        s.location,
        s.lat,
        s.lng,
        s.status AS seller_status,
        s.looking_for,
        s.furnishing_preference,

        -- Seller details
        s.name          AS seller_name,
        s.email         AS seller_email,
        s.owner_contact AS seller_contact,

        --  BUYER ↔ SELLER STATUS
        COALESCE(bps.status, 'New') AS buyer_property_status,

        (
          6371 * acos(
            cos(radians(?)) *
            cos(radians(s.lat)) *
            cos(radians(s.lng) - radians(?)) +
            sin(radians(?)) *
            sin(radians(s.lat))
          )
        ) AS distance_km
      FROM sellers s
      LEFT JOIN buyer_property_status bps
        ON bps.seller_id = s.id
        AND bps.buyer_id = ?
        AND bps.tenant_id = ?
      WHERE s.tenant_id = ?
        AND s.status = 'LISTED'
        AND s.is_deleted = 0
      ORDER BY distance_km ASC
      `,
      [
        buyer.lat,
        buyer.lng,
        buyer.lat,
        buyerId,
        tenantId,
        tenantId,
      ]
    );

    // 3️⃣ Calculate match score for each seller
    const matchedSellers = rows.map((seller: any) => {
      const match = calculateMatch(buyer, seller, seller.distance_km);
      return {
        ...seller,
        matchScore: match.score,
        matchPercentage: match.percentage,
        matchDetails: match.matchDetails,
        maxScore: match.maxScore,
      };
    });

    // 4️⃣ Sort by match percentage (highest first), then distance
    matchedSellers.sort((a: any, b: any) => {
      if (b.matchPercentage === a.matchPercentage) {
        return a.distance_km - b.distance_km;
      }
      return b.matchPercentage - a.matchPercentage;
    });

    return NextResponse.json({ matches: matchedSellers });
  } catch (err) {
    console.error("Buyer match error:", err);
    return NextResponse.json({ matches: [] }, { status: 500 });
  } finally {
    conn.release();
  }
}