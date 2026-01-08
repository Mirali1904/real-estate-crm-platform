import { NextResponse } from "next/server";
import { documentService } from "@/server/service/documentService";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const entity_type = searchParams.get("entity_type") as
    | "buyer"
    | "seller";
  const entity_id = Number(searchParams.get("entity_id"));

  if (!entity_type || !entity_id) {
    return NextResponse.json([], { status: 200 });
  }

  const docs = await documentService.getDocuments(
    entity_type,
    entity_id
  );

  return NextResponse.json(docs);
}
