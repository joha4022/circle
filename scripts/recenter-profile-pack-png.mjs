import fs from "node:fs/promises";
import sharp from "sharp";

const SIZE_OUT = 128;
const BORDER_PAD = 6;

function isForeground(r, g, b) {
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max - min;
  return luma > 58 || sat > 22;
}

async function recenterOne(pathIn) {
  const img = sharp(pathIn);
  const meta = await img.metadata();
  if (!meta.width || !meta.height) throw new Error(`Missing size for ${pathIn}`);

  const { data, info } = await img
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const ch = info.channels;

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * ch;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      if (a < 8) continue;
      if (!isForeground(r, g, b)) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }

  if (maxX < minX || maxY < minY) {
    minX = 0;
    minY = 0;
    maxX = width - 1;
    maxY = height - 1;
  }

  const boxW = maxX - minX + 1;
  const boxH = maxY - minY + 1;
  const side = Math.max(boxW, boxH) + BORDER_PAD * 2;

  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;

  let left = Math.round(cx - side / 2);
  let top = Math.round(cy - side / 2);
  let right = left + side;
  let bottom = top + side;

  if (left < 0) {
    right -= left;
    left = 0;
  }
  if (top < 0) {
    bottom -= top;
    top = 0;
  }
  if (right > width) {
    left -= right - width;
    right = width;
  }
  if (bottom > height) {
    top -= bottom - height;
    bottom = height;
  }

  left = Math.max(0, left);
  top = Math.max(0, top);

  const extractW = Math.max(1, right - left);
  const extractH = Math.max(1, bottom - top);

  const circleMask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE_OUT}" height="${SIZE_OUT}" viewBox="0 0 ${SIZE_OUT} ${SIZE_OUT}"><circle cx="${SIZE_OUT / 2}" cy="${SIZE_OUT / 2}" r="${SIZE_OUT / 2}" fill="white"/></svg>`
  );

  const tmp = `${pathIn}.tmp`;

  await sharp(pathIn)
    .extract({ left, top, width: extractW, height: extractH })
    .resize(SIZE_OUT, SIZE_OUT, { fit: "cover", kernel: "lanczos3" })
    .composite([{ input: circleMask, blend: "dest-in" }])
    .sharpen(1.2, 1.0, 2.0)
    .png({ compressionLevel: 9 })
    .toFile(tmp);

  await fs.rename(tmp, pathIn);
}

async function main() {
  for (let i = 1; i <= 80; i += 1) {
    const id = String(i).padStart(2, "0");
    const p = `public/profile-pack/profile-${id}.png`;
    await recenterOne(p);
  }
  console.log("Recentered and regenerated 80 PNG profile images.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
