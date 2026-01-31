import "./styles/global.css";

const ASCII_CHARS: string =
    "@&%QWNM0gB$#DR8mHXKAUbGOpV4d9h6PkqwSE2]ayjxY5Zoen[ult13If}C{iF|(7J)vTLs?z/*cr!+<>;=^,_:'-.`",
  COLOR_SPACE: PredefinedColorSpace = "srgb";

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
  renderedCanvasCtx.imageSmoothingEnabled = false;

  offscreenCanvasEl = document.createElement("canvas");
  offscreenCanvasCtx = offscreenCanvasEl.getContext("2d", {
    willReadFrequently: true,
    colorSpace: COLOR_SPACE,
  })!;
  offscreenCanvasCtx.imageSmoothingEnabled = false;

  if (!renderedCanvasCtx || !offscreenCanvasCtx) {
    throw new Error("Canvas context not found");
  }

  const HEIGHT = renderedCanvasEl.height / 2,
    WIDTH = renderedCanvasEl.width / 2;

  renderedCanvasEl.height = HEIGHT;
  renderedCanvasEl.width = WIDTH;

  offscreenCanvasEl.height = HEIGHT;
  offscreenCanvasEl.width = WIDTH;

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
  renderAscii(renderOffscreen());
  setTimeout(loop, 50);
}

function renderOffscreen(): ImageData {
  offscreenCanvasCtx.drawImage(
    offscreenVideoEl,
    0,
    0,
    renderedCanvasEl.width,
    renderedCanvasEl.height,
  );

  const image = offscreenCanvasCtx.getImageData(
    0,
    0,
    renderedCanvasEl.width,
    renderedCanvasEl.height,
  );

  renderedCanvasCtx.clearRect(
    0,
    0,
    renderedCanvasEl.width,
    renderedCanvasEl.height,
  );

  return image;
}

function renderAscii(image: ImageData) {
  for (let i = 0; i < image.data.length; i += 4) {
    const r = image.data[i + 0];
    const g = image.data[i + 1];
    const b = image.data[i + 2];

    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    const charIndex = Math.floor((luminance / 255) * (ASCII_CHARS.length - 1));
    const char = ASCII_CHARS[charIndex];

    renderedCanvasCtx.fillStyle = `rgb(${r},${g},${b})`;
    renderedCanvasCtx.fillText(
      char,
      (i / 4) % renderedCanvasEl.width,
      Math.floor(i / 4 / renderedCanvasEl.width),
    );
  }
}

async function bootstrap() {
  await init();
  start();
}

bootstrap();
