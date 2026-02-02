import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

/**
 * Calculate match score and details for seller-buyer pair
 */
function calculateMatch(seller: any, buyer: any, distanceKm: number) {
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

  // 5. Looking For (BUY/RENT) - with BUY ↔ SELL mapping
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

  // 6. Furnishing
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
  const sellerId = Number(id);

  const tenantId =
    Number(req.headers.get("x-tenant-id")) ||
    Number(req.nextUrl.searchParams.get("tenantId"));

  if (!sellerId || !tenantId) {
    return NextResponse.json({ matches: [] });
  }

  const conn = await pool.getConnection();

  try {
    // 1️⃣ Fetch seller
    const [sellers]: any = await conn.execute(
      `
      SELECT
        id,
        price,
        bedrooms,
        lat,
        lng,
        property_type,
        looking_for,
        furnishing_preference
      FROM sellers
      WHERE id = ? AND tenant_id = ? AND is_deleted = 0
      `,
      [sellerId, tenantId]
    );

    if (!sellers.length) {
      return NextResponse.json({ matches: [] });
    }

    const seller = sellers[0];

    // 2️⃣ Fetch buyers with their requirements AND property status
    const [rows]: any = await conn.execute(
  `
  SELECT
    b.id,
    b.name,
    b.email,
    b.phone,
    b.budget_min,
    b.budget_max,
    b.bedrooms,
    b.lat,
    b.lng,
    b.radius_km,
    b.requirement,
    b.looking_for,
    b.furnishing_preference,
    b.status AS buyer_status,

    COALESCE(bps.status, 'New') AS property_status,

    -- Simple distance (will be 0 if no coordinates)
    COALESCE(
      (
        6371 * acos(
          cos(radians(?)) *
          cos(radians(b.lat)) *
          cos(radians(b.lng) - radians(?)) +
          sin(radians(?)) *
          sin(radians(b.lat))
        )
      ),
      0
    ) AS distance_km
  FROM buyers b
  LEFT JOIN buyer_property_status bps
    ON bps.buyer_id = b.id
    AND bps.seller_id = ?
    AND bps.tenant_id = ?
  WHERE b.tenant_id = ?
    AND b.is_deleted = 0
    -- ✅ TEMPORARILY COMMENTED OUT FILTERS
    -- AND b.status IN ('ENQUIRY','LEAD','ACTIVE')
  ORDER BY distance_km ASC
  LIMIT 50
  `,
  [
    seller.lat || 0,  // ✅ Default to 0 if null
    seller.lng || 0,
    seller.lat || 0,
    sellerId,
    tenantId,
    tenantId,
  ]
);



    // 3️⃣ Calculate match score for each buyer
    const matchedBuyers = rows.map((buyer: any) => {
  const match = calculateMatch(seller, buyer, buyer.distance_km);

  return {
    buyer_id: buyer.id,
    name: buyer.name,
    email: buyer.email,
    phone: buyer.phone,

    budget_min: buyer.budget_min,
    budget_max: buyer.budget_max,
    bedrooms: buyer.bedrooms,
    distance_km: buyer.distance_km,

    matchScore: match.score,
    matchPercentage: match.percentage,
    matchDetails: match.matchDetails,
    maxScore: match.maxScore,

    // ⭐⭐⭐ THIS IS IMPORTANT ⭐⭐⭐
    status: buyer.property_status,   // ← seller-buyer status ONLY
  };
});


    // 4️⃣ Sort by match percentage (highest first), then distance
    matchedBuyers.sort((a: any, b: any) => {
      if (b.matchPercentage === a.matchPercentage) {
        return a.distance_km - b.distance_km;
      }
      return b.matchPercentage - a.matchPercentage;
    });

    return NextResponse.json({ matches: matchedBuyers });
  } catch (err) {
    console.error("Seller match error:", err);
    return NextResponse.json({ matches: [] }, { status: 500 });
  } finally {
    conn.release();
  }
}