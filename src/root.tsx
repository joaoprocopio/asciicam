import { makeEventListener } from "@solid-primitives/event-listener";
import type { Accessor } from "solid-js";
import { onMount } from "solid-js";

const ASCII_CHARS =
  "`.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@";
const FONT_SIZE = 8;
const CHAR_WIDTH = 8;
const CHAR_HEIGHT = 10;

export function Root() {
  const bufferEl = document.createElement("canvas");
  const bufferCtx = bufferEl.getContext("2d", { willReadFrequently: true });

  let canvasEl!: HTMLCanvasElement;
  let canvasCtx!: CanvasRenderingContext2D;

  createCanvasResizer(() => canvasEl);

  return (
    <canvas
      class="size-full bg-black"
      ref={(canvasRef) => {
        canvasEl = canvasRef;
        canvasCtx = canvasRef.getContext("2d")!;
      }}
    />
  );
}

function createCanvasResizer(canvasEl: Accessor<HTMLCanvasElement>) {
  function resizeCanvas() {
    const resolvedCanvasEl = canvasEl();

    resolvedCanvasEl.width = window.innerWidth;
    resolvedCanvasEl.height = window.innerHeight;
  }

  makeEventListener(
    window,
    "resize",
    () => {
      resizeCanvas();
    },
    { passive: true },
  );

  onMount(() => {
    resizeCanvas();
  });
}

export const stopPropagation =
  <E extends Event>(callback: (event: E) => void): ((event: E) => void) =>
  (e) => {
    e.stopPropagation();
    callback(e);
  };
