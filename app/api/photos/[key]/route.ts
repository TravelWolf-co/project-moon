import { readdir } from "fs/promises";
import path from "path";

import { NextResponse } from "next/server";

const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".mp4", ".webm", ".mov"]);

export async function GET(_request: Request, { params }: { params: { key: string } }) {
  try {
    const folderPath = path.join(process.cwd(), "public", "photos", params.key);
    const entries = await readdir(folderPath, { withFileTypes: true });

    const files = entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((name) => ALLOWED_EXTENSIONS.has(path.extname(name).toLowerCase()))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }))
      .map((name) => `/photos/${params.key}/${name}`);

    return NextResponse.json({ photos: files });
  } catch {
    return NextResponse.json({ photos: [] });
  }
}

