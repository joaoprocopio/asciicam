import { makeEventListener } from "@solid-primitives/event-listener";
import createRAF, { targetFPS } from "@solid-primitives/raf";

import type { Accessor } from "solid-js";
import { createEffect, createResource, onMount } from "solid-js";

const ASCII_CHARS =
  " .`',-:;_!\"^~+<=>?L)JTlrv|x(*IYciju/7\\fnyz4C]o236FVXZehsUa}59HPdkAEGKObmpqtw{1DSg&M#%0RN[8BQ@W$";
const FONT_SIZE = 7;
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

  let bufferEl!: OffscreenCanvas;
  let bufferCtx!: OffscreenCanvasRenderingContext2D;

  const videoEl: HTMLVideoElement = document.createElement("video");

  const [_loopRunning, startLoop, _stopLoop] = createRAF(
    targetFPS(() => {
      bufferCtx.reset();
      bufferCtx.drawImage(videoEl, 0, 0, bufferEl.width, bufferEl.height);

      const image = bufferCtx.getImageData(
        0,
        0,
        bufferEl.width,
        bufferEl.height,
      );
      canvasCtx.reset();
      canvasCtx.fillStyle = `#fff`;

      let idx = 0;

      for (let col = 0; col < bufferEl.height; col++) {
        const py = col * CHAR_HEIGHT;

        for (let row = 0; row < bufferEl.width; row++) {
          const px = row * CHAR_WIDTH;

          const r = image.data[idx];
          const g = image.data[idx + 1];
          const b = image.data[idx + 2];

          idx += 4;

          const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          const char =
            ASCII_CHARS[((lum / 255) * (ASCII_CHARS.length - 1)) | 0];

          canvasCtx.fillText(char, px, py);
        }
      }
    }, 24),
  );

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

  onMount(() => {
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
      ref={(ref) => {
        canvasEl = ref;
        canvasCtx = ref.getContext("2d")!;
        bufferEl = new OffscreenCanvas(canvasEl.width, canvasEl.height);
        bufferCtx = bufferEl.getContext("2d", {
          willReadFrequently: true,
        })!;
        canvasCtx.font = `${FONT_SIZE}px monospace`;
        canvasCtx.textBaseline = "top";
      }}
    />
  );
}

function makeCanvasResizer(props: {
  canvas: Accessor<HTMLCanvasElement | OffscreenCanvas>;
  width: Accessor<number>;
  height: Accessor<number>;
}) {
  // TODO: debounce `resizeCanvas`
  function resizeCanvas(canvas: HTMLCanvasElement | OffscreenCanvas) {
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
