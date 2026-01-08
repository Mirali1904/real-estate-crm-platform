import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { documentService } from "@/server/service/documentService";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ YAHI MAIN FIX HAI
    const { id } = await context.params;
    const documentId = Number(id);

    if (Number.isNaN(documentId)) {
      return NextResponse.json(
        { error: "Invalid document id" },
        { status: 400 }
      );
    }

    // 1️⃣ DB se document lao
    const doc = await documentService.getById(documentId);

    if (!doc) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // 2️⃣ File system se file delete
    const absolutePath = path.join(
      process.cwd(),
      "public",
      doc.file_path
    );

    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }

    // 3️⃣ DB record delete
    await documentService.deleteDocument(documentId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE DOCUMENT ERROR:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
