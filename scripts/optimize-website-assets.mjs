// Uses Sharp already supplied by the installed Next.js dependency tree.
// Regenerate responsive variants after replacing a 1536px website photo.
import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
for (const name of ["hero", "parts", "sedan", "suv", "workshop"]) {
  const backup = new URL("../.asset-backups/2026-11-08/" + name + ".webp", import.meta.url);
  const source = await readFile(existsSync(backup) ? backup : new URL("../public/images/" + name + ".webp", import.meta.url));
  for (const width of [320, 480, 768, 1024]) {
    const image = await sharp(source).resize({ width, withoutEnlargement: true }).webp({ quality: 82, effort: 6 }).toBuffer();
    await writeFile(new URL("../public/images/" + name + "-" + width + ".webp", import.meta.url), image);
  }
}
const heroBackup = new URL("../.asset-backups/2026-11-08/hero.webp", import.meta.url);
const hero = await readFile(existsSync(heroBackup) ? heroBackup : new URL("../public/images/hero.webp", import.meta.url));
for (const width of [480, 640]) {
  const image = await sharp(hero).extract({ left: 572, top: 0, width: 614, height: 1024 }).resize(width, Math.round(width * 5 / 3)).webp({ quality: 82, effort: 6 }).toBuffer();
  await writeFile(new URL("../public/images/hero-mobile-" + width + ".webp", import.meta.url), image);
}
console.log("Responsive WebP variants regenerated; full-size sources preserved.");
