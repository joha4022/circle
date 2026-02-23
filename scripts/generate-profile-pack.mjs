import sharp from "sharp";
import fs from "node:fs/promises";

const INPUT = "profiles.jpg";
const OUTPUT_DIR = "public/profile-pack";
const COLS = 10;
const ROWS = 8;
const CELL_X = 102.5;
const CELL_Y = 102.6;
const START_X = 50;
const START_Y = 36;
const SIZE = 90;
const OUTPUT_SIZE = 128;

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  const circleMask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${OUTPUT_SIZE}" height="${OUTPUT_SIZE}" viewBox="0 0 ${OUTPUT_SIZE} ${OUTPUT_SIZE}"><circle cx="${OUTPUT_SIZE / 2}" cy="${OUTPUT_SIZE / 2}" r="${OUTPUT_SIZE / 2}" fill="white"/></svg>`
  );

  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const index = row * COLS + col + 1;
      const centerX = START_X + col * CELL_X;
      const centerY = START_Y + row * CELL_Y;

      const left = Math.max(0, Math.round(centerX - SIZE / 2));
      const top = Math.max(0, Math.round(centerY - SIZE / 2));

      const out = `${OUTPUT_DIR}/profile-${String(index).padStart(2, "0")}.png`;

      await sharp(INPUT)
        .extract({ left, top, width: SIZE, height: SIZE })
        .resize(OUTPUT_SIZE, OUTPUT_SIZE, {
          fit: "cover",
          kernel: "lanczos3"
        })
        .composite([{ input: circleMask, blend: "dest-in" }])
        .sharpen(1.2, 1.0, 2.0)
        .png({ compressionLevel: 9 })
        .toFile(out);
    }
  }

  console.log(`Generated ${COLS * ROWS} profile images in ${OUTPUT_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
