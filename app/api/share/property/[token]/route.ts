import { NextResponse } from "next/server";
import { conn } from "@/lib/db";

export async function GET(
  req: Request,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;

  // 🔹 PROPERTY + SELLER DATA
  const [rows]: any = await conn.query(
    `
    SELECT 
      s.id,
      s.name,
      s.owner_name,
      s.owner_contact,
      s.email,

      s.property_type,
      s.location,
      s.price,
      s.bedrooms,
      s.lat,
      s.lng
    FROM seller_share_links l
    JOIN sellers s ON s.id = l.seller_id
    WHERE l.token = ?
      AND l.is_active = 1
      AND l.expires_at > NOW()
    `,
    [token]
  );

  if (!rows.length) {
    return NextResponse.json(
      { error: "Invalid or expired link" },
      { status: 403 }
    );
  }

  const row = rows[0];

  // 🔹 PROPERTY IMAGES
  const [images]: any = await conn.query(
    `
    SELECT photo_url
    FROM property_photos
    WHERE seller_id = ?
    `,
    [row.id]
  );

  // ✅ FINAL RESPONSE
  return NextResponse.json({
    property: {
      property_type: row.property_type,
      location: row.location,
      price: row.price,
      bedrooms: row.bedrooms,
      lat: row.lat,
      lng: row.lng,
    },
    seller: {
      name: row.owner_name || row.name, // 🔥 FIX HERE
      email: row.email,
      contact: row.owner_contact,
    },
    images,
  });
}
