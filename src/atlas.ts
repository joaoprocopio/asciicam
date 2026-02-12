export const ASCII_CHARS =
  " .`',-:;_!\"^~+<=>?L)JTlrv|x(*IYciju/7\\fnyz4C]o236FVXZehsUa}59HPdkAEGKObmpqtw{1DSg&M#%0RN[8BQ@W$";

export const FONT_SIZE = 7;
export const CHAR_WIDTH = 8;
export const CHAR_HEIGHT = 10;
export const NUM_CHARS = ASCII_CHARS.length;

/**
 * Renders every ASCII character in `ASCII_CHARS` into a single-row canvas atlas.
 * The returned canvas is `NUM_CHARS * CHAR_WIDTH` pixels wide and `CHAR_HEIGHT` pixels tall.
 * Each cell is `CHAR_WIDTH x CHAR_HEIGHT` and contains one white glyph on a black background.
 */
export function createCharAtlas(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = NUM_CHARS * CHAR_WIDTH;
  canvas.height = CHAR_HEIGHT;

  const ctx = canvas.getContext("2d")!;

  // Black background
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // White glyphs
  ctx.fillStyle = "#fff";
  ctx.font = `${FONT_SIZE}px monospace`;
  ctx.textBaseline = "top";

  for (let i = 0; i < NUM_CHARS; i++) {
    ctx.fillText(ASCII_CHARS[i], i * CHAR_WIDTH, 0);
  }

  return canvas;
}
