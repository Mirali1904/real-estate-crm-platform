import { NextResponse } from "next/server";
import { conn } from "@/lib/db";
import path from "path";
import fs from "fs";
import sharp from "sharp";

export const runtime = "nodejs";

/* =========================
   UPLOAD FOLDER SETUP
========================= */

const uploadDir = path.join(
  process.cwd(),
  "public/uploads/properties"
);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/* =========================
   POST: UPLOAD PHOTOS
========================= */

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sellerId } = await params;

    const formData = await req.formData();
    const files = formData.getAll("photos") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: "No photos uploaded" },
        { status: 400 }
      );
    }

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // ✅ always save as JPG
      const baseName = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
const fullName = `${baseName}.jpg`;
const thumbName = `${baseName}-thumb.jpg`;

const fullPath = path.join(uploadDir, fullName);
const thumbPath = path.join(uploadDir, thumbName);


      // 🔹 FULL IMAGE (DETAIL PAGE)
await sharp(buffer)
  .resize({
    width: 2000,
    withoutEnlargement: true,
  })
  .sharpen() 
  .jpeg({ quality: 92 })
  .toFile(fullPath);

// 🔹 THUMB IMAGE (CARD VIEW — NO BLUR)
await sharp(buffer)
  .resize({
    width: 1200, // 👈 CARD SIZE
  })
    .sharpen()
  .jpeg({ quality: 95 })
  .toFile(thumbPath);


      // ✅ SAVE PATH IN DB
     await conn.execute(
  `INSERT INTO property_photos (seller_id, photo_url)
   VALUES (?, ?)`,
  [sellerId, `/uploads/properties/${fullName}`]
);


      await conn.execute(
  `UPDATE sellers
   SET cover_photo = ?
   WHERE id = ? AND cover_photo IS NULL`,
  [`/uploads/properties/${thumbName}`, sellerId]
);


    }

    return NextResponse.json({
      success: true,
      message: "Photos uploaded successfully",
    });
  } catch (error) {
    console.error("Photo upload error:", error);
    return NextResponse.json(
      { success: false, message: "Upload failed" },
      { status: 500 }
    );
  }
}

/* =========================
   GET: FETCH PHOTOS
========================= */

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sellerId } = await params;

  const [rows]: any = await conn.execute(
    `SELECT id, photo_url
     FROM property_photos
     WHERE seller_id = ?
     ORDER BY created_at DESC`,
    [sellerId]
  );

  return NextResponse.json(rows);
}
