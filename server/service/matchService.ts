// server/service/matchService.ts
import { conn } from "@/lib/db";

/** Haversine distance km */
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Compute match score with detailed breakdown
 * Returns { score, maxScore, matchDetails, percentage }
 */
function computeMatchScore(buyer: any, seller: any, distanceKm: number) {
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

  // 1. Location/Radius match
  const radius = buyer.radius_km != null ? Number(buyer.radius_km) : 5;
  if (!isNaN(distanceKm) && distanceKm <= radius) {
    score += 1;
    matchDetails.location = true;
  }

  // 2. Budget match
  const bmin = buyer.budget_min != null ? Number(buyer.budget_min) : null;
  const bmax = buyer.budget_max != null ? Number(buyer.budget_max) : null;
  if (bmin != null && bmax != null && seller.price != null) {
    if (Number(seller.price) >= bmin && Number(seller.price) <= bmax) {
      score += 1;
      matchDetails.budget = true;
    }
  }

  // 3. Bedrooms match
  if (buyer.bedrooms && seller.bedrooms && Number(buyer.bedrooms) === Number(seller.bedrooms)) {
    score += 1;
    matchDetails.bedrooms = true;
  }

  // 4. Property type match
  if (buyer.requirement && seller.property_type) {
    if ((String(buyer.requirement).toLowerCase()).includes(String(seller.property_type).toLowerCase())) {
      score += 1;
      matchDetails.propertyType = true;
    }
  }

  // 5. Looking For match (BUY/RENT) - both use 'looking_for' column
  if (buyer.looking_for && seller.looking_for) {
  const buyerLF = buyer.looking_for.toUpperCase();
  const sellerLF = seller.looking_for.toUpperCase();

  // BUY ↔ SELL
  if (buyerLF === "BUY" && sellerLF === "SELL") {
    score += 1;
    matchDetails.lookingFor = true;
  }

  // RENT ↔ RENT
  if (buyerLF === "RENT" && sellerLF === "RENT") {
    score += 1;
    matchDetails.lookingFor = true;
  }
}


  // 6. Furnishing match - both use 'furnishing_preference' column
  if (buyer.furnishing_preference && seller.furnishing_preference) {
    const buyerFurnishing = String(buyer.furnishing_preference).toUpperCase();
    const sellerFurnishing = String(seller.furnishing_preference).toUpperCase();
    
    // Normalize variations
    const normalizeFurnishing = (val: string) => val.replace(/[-_\s]/g, '');
    
    if (normalizeFurnishing(buyerFurnishing) === normalizeFurnishing(sellerFurnishing)) {
      score += 1;
      matchDetails.furnishing = true;
    }
  }

  const percentage = Math.round((score / maxScore) * 100);

  return {
    score,
    maxScore,
    matchDetails,
    percentage,
  };
}

/**
 * Find sellers for a buyer (tenant-limited).
 * returns array { seller, distance_km, matchScore, matchPercentage, matchDetails }
 */
export async function findSellersForBuyer(tenantId: number, buyerId: number, limit = 25) {
  const [brows]: any = await conn.execute(
    "SELECT * FROM buyers WHERE id = ? AND tenant_id = ?", 
    [buyerId, tenantId]
  );
  const buyer = brows && brows[0];
  if (!buyer) return [];

  const [srows]: any = await conn.execute(
    "SELECT * FROM sellers WHERE tenant_id = ? AND status IN ('LISTED','ACTIVE')",
    [tenantId]
  );
  const sellers = srows || [];

  const scored: any[] = [];
  for (const s of sellers) {
    if (buyer.lat == null || buyer.lng == null || s.lat == null || s.lng == null) continue;
    
    const distance_km = haversineKm(Number(buyer.lat), Number(buyer.lng), Number(s.lat), Number(s.lng));
    const matchResult = computeMatchScore(buyer, s, distance_km);
    
    scored.push({ 
      seller: s, 
      distance_km,
      matchScore: matchResult.score,
      matchPercentage: matchResult.percentage,
      matchDetails: matchResult.matchDetails,
      maxScore: matchResult.maxScore,
    });
  }

  // Sort by percentage (highest first), then by distance (nearest first)
  scored.sort((a, b) => {
    if (b.matchPercentage === a.matchPercentage) {
      return a.distance_km - b.distance_km;
    }
    return b.matchPercentage - a.matchPercentage;
  });

  return scored.slice(0, limit);
}

/**
 * Find buyers for a seller (tenant-limited).
 * returns array { buyer, distance_km, matchScore, matchPercentage, matchDetails }
 */
export async function findBuyersForSeller(tenantId: number, sellerId: number, limit = 25) {
  const [srows]: any = await conn.execute(
    "SELECT * FROM sellers WHERE id = ? AND tenant_id = ?", 
    [sellerId, tenantId]
  );
  const seller = srows && srows[0];
  if (!seller) return [];

  const [brows]: any = await conn.execute(
    "SELECT * FROM buyers WHERE tenant_id = ? AND status IN ('ENQUIRY','LEAD','ACTIVE')",
    [tenantId]
  );
  const buyers = brows || [];

  const scored: any[] = [];
  for (const b of buyers) {
    if (b.lat == null || b.lng == null || seller.lat == null || seller.lng == null) continue;
    
    const distance_km = haversineKm(Number(b.lat), Number(b.lng), Number(seller.lat), Number(seller.lng));
    const matchResult = computeMatchScore(b, seller, distance_km);
    
    scored.push({ 
      buyer: b, 
      distance_km,
      matchScore: matchResult.score,
      matchPercentage: matchResult.percentage,
      matchDetails: matchResult.matchDetails,
      maxScore: matchResult.maxScore,
    });
  }

  // Sort by percentage (highest first), then by distance (nearest first)
  scored.sort((a, b) => {
    if (b.matchPercentage === a.matchPercentage) {
      return a.distance_km - b.distance_km;
    }
    return b.matchPercentage - a.matchPercentage;
  });

  return scored.slice(0, limit);
}