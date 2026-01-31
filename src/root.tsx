import { createCameras } from "@solid-primitives/devices";
import { makeEventListener } from "@solid-primitives/event-listener";

import type { Accessor } from "solid-js";
import { createEffect } from "solid-js";

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

  const cameras = createCameras();
  createEffect(() => {
    console.log(cameras());
  });

  makeCanvasResizer({
    canvas: () => canvasEl,
    width: () => window.innerWidth,
    height: () => window.innerHeight,
  });

  makeCanvasResizer({
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

function makeCanvasResizer(props: {
  canvas: Accessor<HTMLCanvasElement>;
  width: Accessor<number>;
  height: Accessor<number>;
}) {
  // TODO: debounce `resizeCanvas`
  function resizeCanvas(canvas: HTMLCanvasElement) {
    canvas.width = props.width();
    canvas.height = props.height();
  }

  createEffect(() => {
    const canvas = props.canvas();
    if (!(canvas instanceof HTMLElement)) return;

    resizeCanvas(canvas);
    makeEventListener(window, "resize", () => resizeCanvas(canvas), {
      passive: true,
    });
  });
}
