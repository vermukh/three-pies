// Render the original vector paths to transparent web assets.
// Run from the repository root: node client/scripts/export-brand-assets.mjs
import { chromium } from "@playwright/test";
import { readFile, writeFile } from "node:fs/promises";

const publicDir = new URL("../public/", import.meta.url);
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
});
try {
  const page = await browser.newPage();
  for (const name of ["logo", "logo-light"]) {
    const svg = await readFile(
      new URL(`images/brand/${name}.svg`, publicDir),
      "utf8",
    );
    for (const format of ["png", "webp"]) {
      await render(svg, 1024, 1040, format, `images/brand/${name}.${format}`);
    }
  }
  const favicon = await readFile(new URL("favicon.svg", publicDir), "utf8");
  await render(favicon, 32, 32, "png", "favicon-32.png");
  await render(favicon, 180, 180, "png", "apple-touch-icon.png");

  async function render(svg, width, height, format, filename) {
    const data = await page.evaluate(
      async ({ svg, width, height, format }) => {
        const image = new Image();
        image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
        await image.decode();
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(image, 0, 0, width, height);
        return canvas.toDataURL(`image/${format}`, 0.95).split(",")[1];
      },
      { svg, width, height, format },
    );
    await writeFile(new URL(filename, publicDir), Buffer.from(data, "base64"));
    console.log(filename);
  }
} finally {
  await browser.close();
}
