import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const publicDir = path.resolve(process.cwd(), "public");

const logoCandidates = [
  "logo.png",
  "logo.svg",
  "favicon.png",
  "favicon.ico",
  "kik.png",
  "logo512.png",
  "logo192.png",
];

const targets = [
  { fileName: "pwa-192x192.png", size: 192 },
  { fileName: "pwa-512x512.png", size: 512 },
  { fileName: "apple-touch-icon-180x180.png", size: 180 },
];

const fileExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

const findLogo = async () => {
  const matches = [];

  for (const candidate of logoCandidates) {
    const filePath = path.join(publicDir, candidate);

    if (await fileExists(filePath)) {
      matches.push(filePath);
    }
  }

  return matches;
};

const generateIcon = async (source, target) => {
  await sharp(source, { animated: false })
    .resize(target.size, target.size, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .png({
      compressionLevel: 9,
      adaptiveFiltering: true,
      quality: 100,
    })
    .toFile(path.join(publicDir, target.fileName));
};

const run = async () => {
  const logos = await findLogo();

  if (!logos.length) {
    throw new Error(
      "No logo source found in public/. Expected logo.png, logo.svg, favicon.png, favicon.ico, kik.png, logo512.png, or logo192.png.",
    );
  }

  let lastError;

  for (const logo of logos) {
    try {
      await Promise.all(targets.map((target) => generateIcon(logo, target)));
      console.log(`Generated PWA icons from ${path.relative(process.cwd(), logo)}`);
      return;
    } catch (error) {
      lastError = error;
      console.warn(
        `Could not generate icons from ${path.relative(process.cwd(), logo)}: ${error.message}`,
      );
    }
  }

  throw lastError;
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
