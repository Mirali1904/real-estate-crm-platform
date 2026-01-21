import { NextResponse } from "next/server";
import { conn } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = Number(searchParams.get("userId"));
    const tenantId = Number(searchParams.get("tenantId"));

    if (!userId || !tenantId) {
      return NextResponse.json(
        { error: "Missing userId or tenantId" },
        { status: 400 }
      );
    }

    const [rows]: any = await conn.execute(
      `
      SELECT
        id,
        name,
        email,
        phone,
        company_name,
        position,
        street_address,
        city,
        state,
        zip_code,
        country,
        bio
      FROM users
      WHERE id = ? AND tenant_id = ?
      LIMIT 1
      `,
      [userId, tenantId]
    );

    if (!rows.length) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("PROFILE GET ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}


export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const {
      userId,
      tenantId,
      name,
      phone,
      company_name,
      position,
      street_address,
      city,
      state,
      zip_code,
      country,
      bio,
    } = body;

    if (!userId || !tenantId) {
      return NextResponse.json(
        { error: "Missing userId or tenantId" },
        { status: 400 }
      );
    }

    await conn.execute(
      `
      UPDATE users SET
        name = ?,
        phone = ?,
        company_name = ?,
        position = ?,
        street_address = ?,
        city = ?,
        state = ?,
        zip_code = ?,
        country = ?,
        bio = ?
      WHERE id = ? AND tenant_id = ?
      `,
      [
        name,
        phone,
        company_name,
        position,
        street_address,
        city,
        state,
        zip_code,
        country,
        bio,
        userId,
        tenantId,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PROFILE UPDATE ERROR:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
