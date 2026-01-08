import { NextResponse } from "next/server";
import { conn } from "@/lib/db";
import path from "path";
import fs from "fs";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const loanId = Number(id);

    if (!loanId || isNaN(loanId)) {
      return NextResponse.json(
        { error: "Invalid loan id" },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
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

    fs.writeFileSync(
      path.join(uploadDir, fileName),
      buffer
    );

    await conn.query(
      `INSERT INTO loan_documents (loan_id, file_name, file_path)
       VALUES (?, ?, ?)`,
      [loanId, file.name, filePath]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
