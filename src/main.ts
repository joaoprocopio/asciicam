import "./styles/global.css";

const ASCII_CHARS: string =
  "@&%QWNM0gB$#DR8mHXKAUbGOpV4d9h6PkqwSE2]ayjxY5Zoen[ult13If}C{iF|(7J)vTLs?z/*cr!+<>;=^,_:'-.`";

const COLOR_SPACE: PredefinedColorSpace = "srgb";

let running: boolean = false,
  rootEl: HTMLElement,
  renderedCanvasEl: HTMLCanvasElement,
  renderedCanvasCtx: CanvasRenderingContext2D,
  offscreenCanvasEl: HTMLCanvasElement,
  offscreenCanvasCtx: CanvasRenderingContext2D,
  offscreenVideoEl: HTMLVideoElement,
  stream: MediaStream;

async function init() {
  rootEl = document.getElementById("__root__")!;

  if (!rootEl) {
    throw new Error("Root element not found");
  }

  renderedCanvasEl = document.createElement("canvas");
  renderedCanvasEl.classList.add("size-full");
  rootEl.appendChild(renderedCanvasEl);

  renderedCanvasCtx = renderedCanvasEl.getContext("2d", {
    colorSpace: COLOR_SPACE,
  })!;

  offscreenCanvasEl = document.createElement("canvas");
  offscreenCanvasCtx = offscreenCanvasEl.getContext("2d", {
    willReadFrequently: true,
    colorSpace: COLOR_SPACE,
  })!;

  if (!renderedCanvasCtx || !offscreenCanvasCtx) {
    throw new Error("Canvas context not found");
  }

  renderedCanvasEl.height = renderedCanvasEl.height;
  renderedCanvasEl.width = renderedCanvasEl.width;

  offscreenCanvasEl.height = renderedCanvasEl.height;
  offscreenCanvasEl.width = renderedCanvasEl.width;

  stream = await navigator.mediaDevices.getUserMedia({
    video: true,
  });

  offscreenVideoEl = document.createElement("video");
  offscreenVideoEl.srcObject = stream;
  offscreenVideoEl.playsInline = true;
  offscreenVideoEl.muted = true;

  await offscreenVideoEl.play();
}

function start() {
  if (running) return;
  running = true;
  loop();
}

function loop() {
  offscreenCanvasCtx.drawImage(
    offscreenVideoEl,
    0,
    0,
    renderedCanvasEl.width,
    renderedCanvasEl.height,
  );

  const imageData = offscreenCanvasCtx.getImageData(
    0,
    0,
    renderedCanvasEl.width,
    renderedCanvasEl.height,
  );

  renderedCanvasCtx.drawImage(
    offscreenVideoEl,
    0,
    0,
    renderedCanvasEl.width,
    renderedCanvasEl.height,
  );

  setTimeout(loop, 50);
}

async function bootstrap() {
  await init();
  start();
}

bootstrap();
