import { makeEventListener } from "@solid-primitives/event-listener";
import { onMount } from "solid-js";

const ASCII_CHARS =
  "`.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@";
const FONT_SIZE = 8;
const CHAR_WIDTH = 8;
const CHAR_HEIGHT = 10;

export function Root() {
  let canvasEl: HTMLCanvasElement;
  let context: CanvasRenderingContext2D;

  makeEventListener(
    window,
    "resize",
    (event) => {
      resizeCanvas(canvasEl);
    },
    { passive: true },
  );

  onMount(() => {
    resizeCanvas(canvasEl);
  });

  return (
    <canvas
      class="size-full bg-black"
      ref={(canvasRef) => {
        canvasEl = canvasRef;
        context = canvasRef.getContext("2d")!;
      }}
    ></canvas>
  );
}

function resizeCanvas(canvasEl: HTMLCanvasElement) {
  console.log("a");
  canvasEl.width = window.innerWidth;
  canvasEl.height = window.innerHeight;
}
