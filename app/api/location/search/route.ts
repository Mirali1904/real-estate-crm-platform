import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");

  if (!q || q.length < 3) {
    return NextResponse.json([]);
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`,
      {
        headers: {
          "User-Agent": "RealEstateCRM/1.0 (contact: admin@realestatecrm.com)",
        },
      }
    );

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Location search failed:", error);
    return NextResponse.json([], { status: 500 });
  }
}
