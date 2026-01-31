import { createEventListener } from "@solid-primitives/event-listener";
import { createEffect } from "solid-js";

const ASCII_CHARS =
  "`.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@";
const COLOR_SPACE = "srgb" satisfies PredefinedColorSpace;
const FONT_SIZE = 8;
const CHAR_WIDTH = 8;
const CHAR_HEIGHT = 10;

export function Root() {
  let canvasEl: HTMLCanvasElement;
  let context: CanvasRenderingContext2D;

  createEffect(() => {
    console.log(canvasEl);
    console.log(context);
  });

  return (
    <canvas
      ref={(canvasRef) => {
        canvasEl = canvasRef;
        context = canvasRef.getContext("2d")!;
      }}
    ></canvas>
  );
}
