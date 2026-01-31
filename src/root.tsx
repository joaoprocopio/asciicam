import { makeEventListener } from "@solid-primitives/event-listener";
import createRAF from "@solid-primitives/raf";

import type { Accessor } from "solid-js";
import { createEffect, createResource, on, onMount } from "solid-js";

const ASCII_CHARS =
  "`.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@";
const FONT_SIZE = 8;
const CHAR_WIDTH = 8;
const CHAR_HEIGHT = 10;

export function Root() {
  const [camera] = createResource(() =>
    navigator.mediaDevices.getUserMedia({
      video: true,
    }),
  );

  let canvasEl!: HTMLCanvasElement;
  let canvasCtx!: CanvasRenderingContext2D;

  const bufferEl: HTMLCanvasElement = document.createElement("canvas");
  const bufferCtx: CanvasRenderingContext2D = bufferEl.getContext("2d", {
    willReadFrequently: true,
  })!;

  const videoEl: HTMLVideoElement = document.createElement("video");

  const [loopRunning, startLoop, stopLoop] = createRAF(() => {
    canvasCtx.clearRect(0, 0, canvasEl.width, canvasEl.height);
    bufferCtx.drawImage(videoEl, 0, 0, bufferEl.width, bufferEl.height);
    const image = bufferCtx.getImageData(0, 0, bufferEl.width, bufferEl.height);
    for (let i = 0; i < image.data.length; i += 4) {
      const luminance =
          0.2126 * image.data[i + 0] +
          0.7152 * image.data[i + 1] +
          0.0722 * image.data[i + 2],
        charIndex = Math.floor((luminance / 255) * (ASCII_CHARS.length - 1)),
        char = ASCII_CHARS[charIndex],
        pixelIndex = i / 4,
        pixelX = (pixelIndex % bufferEl.width) * CHAR_WIDTH,
        pixelY = Math.floor(pixelIndex / bufferEl.width) * CHAR_HEIGHT;

      canvasCtx.fillStyle = `#fff`;
      canvasCtx.fillText(char, pixelX, pixelY);
    }
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

  createEffect(() => {
    if (
      !(canvasEl instanceof HTMLElement) ||
      !(bufferEl instanceof HTMLElement)
    )
      return;

    canvasCtx.font = `${FONT_SIZE}px monospace`;
    canvasCtx.textBaseline = "top";

    startLoop();
  });

  createEffect(async () => {
    videoEl.srcObject = camera()!;
    videoEl.playsInline = true;
    videoEl.muted = true;

    await videoEl.play();
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
