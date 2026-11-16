// Makes the icon files from public/favicon.svg, and turns a screenshot of the sharing card
// (public/_og.html, captured separately) into public/og-image.jpg.
//   node scripts/make-brand-assets.mjs [path-to-og-screenshot.png]
import { readFile } from "node:fs/promises";
import sharp from "sharp";

const svg = await readFile("public/favicon.svg");

for (const [file, size] of [
  ["public/favicon-32.png", 32],
  ["public/apple-touch-icon.png", 180],
  ["public/icon-192.png", 192],
  ["public/icon-512.png", 512],
]) {
  await sharp(svg, { density: 384 }).resize(size, size).png().toFile(file);
  console.log("made", file);
}

const screenshot = process.argv[2];
if (screenshot) {
  await sharp(screenshot).resize(1200, 630).jpeg({ quality: 82, mozjpeg: true }).toFile("public/og-image.jpg");
  console.log("made public/og-image.jpg");
}
