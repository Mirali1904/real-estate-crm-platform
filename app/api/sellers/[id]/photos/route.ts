import { NextResponse } from "next/server";
import { conn } from "@/lib/db";
import multer from "multer";
import path from "path";
import fs from "fs";

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
   MULTER CONFIG
========================= */

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

upload.array("photos", 10)


/* =========================
   POST: UPLOAD PHOTOS
========================= */

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sellerId } = await params;

  const formData = await req.formData();
  const files = formData.getAll("photos") as File[];

  if (!files || files.length === 0) {
    return NextResponse.json(
      { success: false, message: "No photos uploaded" },
      { status: 400 }
    );
  }

  const uploadDir = path.join(
    process.cwd(),
    "public/uploads/properties"
  );

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = `${Date.now()}-${file.name}`;
    const filepath = path.join(uploadDir, filename);

    fs.writeFileSync(filepath, buffer);

    await conn.execute(
      `INSERT INTO property_photos (seller_id, photo_url)
       VALUES (?, ?)`,
      [sellerId, `/uploads/properties/${filename}`]
    );
  }

  return NextResponse.json({
    success: true,
    message: "Photos uploaded successfully",
  });
}
export async function GET(
  req: Request,
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
