import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { documentService } from "@/server/service/documentService";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File;
    const entity_type = formData.get("entity_type") as "buyer" | "seller";
    const entity_id = Number(formData.get("entity_id"));
    const tenant_id = Number(formData.get("tenant_id"));
    const uploaded_by = Number(formData.get("uploaded_by"));

    if (
  !file ||
  !entity_type ||
  Number.isNaN(entity_id) ||
  Number.isNaN(tenant_id) ||
  Number.isNaN(uploaded_by)
) {
  return NextResponse.json(
    { error: "Missing or invalid data" },
    { status: 400 }
  );
}

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `/uploads/${fileName}`;

    fs.writeFileSync(path.join(uploadDir, fileName), buffer);

    await documentService.addDocument({
      tenant_id,
      entity_type,
      entity_id,
      file_name: file.name,
      file_path: filePath,
      uploaded_by,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
