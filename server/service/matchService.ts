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

function computeScore(buyer: any, seller: any, distanceKm: number) {
  let score = 0;
  const radius = buyer.radius_km != null ? Number(buyer.radius_km) : 5;
  if (!isNaN(distanceKm) && distanceKm <= radius) score += 4; // proximity high weight

  // budget match
  const bmin = buyer.budget_min != null ? Number(buyer.budget_min) : null;
  const bmax = buyer.budget_max != null ? Number(buyer.budget_max) : null;
  if (bmin == null || bmax == null) score += 1;
  else if (seller.price != null && Number(seller.price) >= bmin && Number(seller.price) <= bmax) score += 3;

  // bedrooms
  if (buyer.bedrooms && seller.bedrooms && Number(buyer.bedrooms) === Number(seller.bedrooms)) score += 1;

  // property type in requirement (loose)
  if (buyer.requirement && seller.property_type) {
    if ((String(buyer.requirement).toLowerCase()).includes(String(seller.property_type).toLowerCase())) score += 1;
  }

  return score;
}

/**
 * Find sellers for a buyer (tenant-limited).
 * returns array { seller, distance_km, score }
 */
export async function findSellersForBuyer(tenantId: number, buyerId: number, limit = 25) {
  const [brows]: any = await conn.execute("SELECT * FROM buyers WHERE id = ? AND tenant_id = ?", [buyerId, tenantId]);
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
    const score = computeScore(buyer, s, distance_km);
    scored.push({ seller: s, distance_km, score });
  }

  scored.sort((a, b) => {
    if (b.score === a.score) return a.distance_km - b.distance_km;
    return b.score - a.score;
  });

  return scored.slice(0, limit);
}

/**
 * Find buyers for a seller (tenant-limited).
 * returns array { buyer, distance_km, score }
 */
export async function findBuyersForSeller(tenantId: number, sellerId: number, limit = 25) {
  const [srows]: any = await conn.execute("SELECT * FROM sellers WHERE id = ? AND tenant_id = ?", [sellerId, tenantId]);
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
    const score = computeScore(b, seller, distance_km);
    scored.push({ buyer: b, distance_km, score });
  }

  scored.sort((a, b) => {
    if (b.score === a.score) return a.distance_km - b.distance_km;
    return b.score - a.score;
  });

  return scored.slice(0, limit);
}
