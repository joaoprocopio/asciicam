const ATLAS_COLS = 10;
const ATLAS_ROWS = 10;

export function createGlyphAtlas(
  chars: string,
  charWidth: number,
  charHeight: number,
  fontSize: number,
) {
  const width = ATLAS_COLS * charWidth;
  const height = ATLAS_ROWS * charHeight;

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#fff";
  ctx.font = `${fontSize}px monospace`;
  ctx.textBaseline = "top";

  for (let i = 0; i < chars.length; i++) {
    const col = i % ATLAS_COLS;
    const row = Math.floor(i / ATLAS_COLS);
    ctx.fillText(chars[i], col * charWidth, row * charHeight);
  }

  return { canvas, cols: ATLAS_COLS, rows: ATLAS_ROWS };
}
