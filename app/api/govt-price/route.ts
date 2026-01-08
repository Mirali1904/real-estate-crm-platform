import { NextResponse } from "next/server";
import { getGovtCircleRate } from "@/server/service/govtPrice.service";


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const location = searchParams.get("location");
  const size = Number(searchParams.get("size"));

  if (!location || !size) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const rateData = await getGovtCircleRate(location);

  if (!rateData) {
    return NextResponse.json({ error: "No govt data found" });
  }

 const ratePerSqft = Number(rateData.rate_per_sqft || 12000);

  const estimatedPrice = ratePerSqft * size;

  return NextResponse.json({
    location,
    size,
    ratePerSqft,
    estimatedPrice,
    source: "Data.gov.in",
  });
}
