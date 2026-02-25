import { makeEventListener } from "@solid-primitives/event-listener";
import { targetFPS, createRAF } from "@solid-primitives/raf";

import { createEffect, createResource, onCleanup, onMount } from "solid-js";

import { createGlyphAtlas } from "./webgl/atlas";
import { createRenderer, type Renderer } from "./webgl/renderer";

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
  let renderer!: Renderer;

  const videoEl: HTMLVideoElement = document.createElement("video");

  const [_loopRunning, startLoop, _stopLoop] = createRAF(
    targetFPS(() => {
      renderer?.renderFrame(videoEl);
    }, 24),
  );

  onMount(() => {
    startLoop();
  });

  onCleanup(() => {
    renderer?.destroy();
  });

  createEffect(async () => {
    videoEl.srcObject = camera()!;
    videoEl.playsInline = true;
    videoEl.muted = true;

    await videoEl.play();
  });

  createEffect(() => {
    if (!canvasEl) return;

    function handleResize() {
      renderer?.resize(window.innerWidth, window.innerHeight);
    }

    handleResize();
    makeEventListener(window, "resize", handleResize, { passive: true });
  });

  return (
    <canvas
      class="size-full bg-black"
      ref={(ref) => {
        canvasEl = ref;

        const atlas = createGlyphAtlas(
          ASCII_CHARS,
          CHAR_WIDTH,
          CHAR_HEIGHT,
          FONT_SIZE,
        );

        renderer = createRenderer({
          canvas: canvasEl,
          atlasCanvas: atlas.canvas,
          atlasGrid: { cols: atlas.cols, rows: atlas.rows },
          charCount: ASCII_CHARS.length,
          cellWidth: CHAR_WIDTH,
          cellHeight: CHAR_HEIGHT,
        });
      }}
    />
  );
}
