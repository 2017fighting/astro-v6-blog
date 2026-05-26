import type { AstroIntegration } from "astro";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import * as cheerio from "cheerio";

const CDN_PREFIX = "https://assets.raenzo.com";

function resolveLocalPath(src: string, outDir: string): string | null {
  let localSrc = src;

  if (localSrc.startsWith(CDN_PREFIX)) {
    localSrc = localSrc.slice(CDN_PREFIX.length);
  }

  localSrc = localSrc.replace(/^\//, "");

  const filePath = path.join(outDir, localSrc);
  return fs.existsSync(filePath) ? filePath : null;
}

function variantPathFor(originalPath: string, format: string): string {
  const ext = path.extname(originalPath);
  const base = originalPath.slice(0, -ext.length);
  return `${base}.${format}`;
}

function variantSrcFor(originalSrc: string, format: string): string {
  const ext = path.extname(originalSrc);
  const base = originalSrc.slice(0, -ext.length);
  return `${base}.${format}`;
}

async function generateVariant(
  sourcePath: string,
  destPath: string,
  format: "avif" | "webp",
): Promise<boolean> {
  if (fs.existsSync(destPath)) return true;

  try {
    const pipeline = sharp(sourcePath);
    if (format === "avif") {
      await pipeline.avif({ quality: 50 }).toFile(destPath);
    } else {
      await pipeline.webp({ quality: 80 }).toFile(destPath);
    }
    return true;
  } catch (e) {
    console.warn(`[picture-images] Failed to generate ${format}: ${destPath}`, e);
    return false;
  }
}

function shouldSkip(src: string | undefined): boolean {
  if (!src || typeof src !== "string") return true;
  const lower = src.toLowerCase();
  if (lower.startsWith("data:")) return true;
  if (lower.endsWith(".svg")) return true;
  return false;
}

async function downloadRemoteImage(
  url: string,
  destPath: string,
): Promise<boolean> {
  if (fs.existsSync(destPath)) return true;

  try {
    const response = await fetch(url);
    if (!response.ok) return false;
    const buffer = Buffer.from(await response.arrayBuffer());
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.writeFileSync(destPath, buffer);
    return true;
  } catch (e) {
    console.warn(`[picture-images] Failed to download: ${url}`, e);
    return false;
  }
}

function hashForUrl(url: string): string {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash).toString(36);
}

async function processHtmlFile(htmlPath: string, outDir: string) {
  let html = fs.readFileSync(htmlPath, "utf-8");
  const $ = cheerio.load(html, { decodeEntities: false });
  let modified = false;

  const imgs = $("img").toArray();

  for (const imgEl of imgs) {
    const img = $(imgEl);
    const src = img.attr("src");

    if (shouldSkip(src)) continue;
    if (img.closest("picture").length > 0) continue;

    const isRemote = src!.startsWith("http");
    let localImagePath: string | null = null;
    let effectiveSrc = src!;

    if (isRemote) {
      const hash = hashForUrl(src!);
      const urlObj = new URL(src!);
      const ext = path.extname(urlObj.pathname) || ".jpg";
      const downloadPath = path.join(outDir, "_astro", `remote-${hash}${ext}`);

      if (await downloadRemoteImage(src!, downloadPath)) {
        localImagePath = downloadPath;
        effectiveSrc = `${CDN_PREFIX}/_astro/remote-${hash}${ext}`;
      } else {
        continue;
      }
    } else {
      localImagePath = resolveLocalPath(src!, outDir);
      if (!localImagePath) continue;
    }

    const currentExt = path.extname(localImagePath).toLowerCase();
    const formats: Array<"avif" | "webp"> = [];

    if (currentExt !== ".avif") formats.push("avif");
    if (currentExt !== ".webp") formats.push("webp");

    if (formats.length === 0) continue;

    const sourceTags: Array<{ srcset: string; type: string }> = [];

    for (const format of formats) {
      const variantLocalPath = variantPathFor(localImagePath, format);
      const success = await generateVariant(localImagePath, variantLocalPath, format);

      if (success) {
        const variantSrc = variantSrcFor(effectiveSrc, format);
        sourceTags.push({
          srcset: variantSrc,
          type: `image/${format}`,
        });
      }
    }

    if (sourceTags.length === 0) continue;

    const picture = $("<picture>");
    for (const s of sourceTags) {
      picture.append($(`<source srcset="${s.srcset}" type="${s.type}" />`));
    }
    picture.append(img.clone());
    img.replaceWith(picture);
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(htmlPath, $.html());
  }
}

async function walkDir(
  dir: string,
  callback: (filePath: string) => Promise<void>,
) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkDir(fullPath, callback);
    } else if (entry.name.endsWith(".html")) {
      await callback(fullPath);
    }
  }
}

export default function pictureImages(): AstroIntegration {
  return {
    name: "picture-images",
    hooks: {
      "astro:build:done": async ({ dir }) => {
        const outDir = fileURLToPath(dir);
        console.log("[picture-images] Processing HTML files in", outDir);
        await walkDir(outDir, (htmlPath) => processHtmlFile(htmlPath, outDir));
        console.log("[picture-images] Done");
      },
    },
  };
}
