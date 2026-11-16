// Makes compressed WebP copies of every photo in public/photos, public/listings and public/team,
// at two widths: 640px for phones and 1280px for larger screens.
//   photos/lagos-bridge.jpg -> photos/lagos-bridge-640.webp, photos/lagos-bridge-1280.webp
// The originals stay in place (the database may point at them). Files that are already
// up to date are skipped, so it is safe to run on every build: `npm run images`.
import { readdir, stat } from "node:fs/promises";
import { join, parse } from "node:path";
import sharp from "sharp";

const FOLDERS = ["public/photos", "public/listings", "public/team"];
const WIDTHS = [640, 1280];
const SOURCE = /\.(jpe?g|png)$/i;

let made = 0;
let skipped = 0;

for (const folder of FOLDERS) {
  const files = (await readdir(folder)).filter((file) => SOURCE.test(file));

  for (const file of files) {
    const source = join(folder, file);
    const { name } = parse(file);
    const sourceTime = (await stat(source)).mtimeMs;

    for (const width of WIDTHS) {
      const target = join(folder, `${name}-${width}.webp`);
      const existing = await stat(target).catch(() => null);
      if (existing && existing.mtimeMs >= sourceTime) {
        skipped += 1;
        continue;
      }

      await sharp(source)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 72, effort: 5 })
        .toFile(target);
      made += 1;
    }
  }
}

console.log(`Images: ${made} made, ${skipped} already up to date.`);
