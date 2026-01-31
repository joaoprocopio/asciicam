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

  createCanvasResizer({
    canvas: () => canvasEl,
    width: () => window.innerWidth,
    height: () => window.innerHeight,
  });

  createCanvasResizer({
    canvas: () => bufferEl,
    width: () => Math.floor(canvasEl.width / CHAR_WIDTH),
    height: () => Math.floor(canvasEl.height / CHAR_HEIGHT),
  });

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

function createCanvasResizer(props: {
  canvas: Accessor<HTMLCanvasElement>;
  width: Accessor<number>;
  height: Accessor<number>;
}) {
  // TODO: debounce
  function resizeCanvas() {
    const canvas = props.canvas();
    canvas.width = props.width();
    canvas.height = props.height();
  }

  makeEventListener(window, "resize", resizeCanvas, { passive: true });
  onMount(resizeCanvas);
}
