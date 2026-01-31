import "./styles/global.css";

const ASCII_CHARS =
    "@&%QWNM0gB$#DR8mHXKAUbGOpV4d9h6PkqwSE2]ayjxY5Zoen[ult13If}C{iF|(7J)vTLs?z/*cr!+<>;=^,_:'-.`",
  COLOR_SPACE = "srgb" satisfies PredefinedColorSpace,
  FONT_SIZE = 11,
  CHAR_WIDTH = 8,
  CHAR_HEIGHT = FONT_SIZE;

let rootEl: HTMLElement,
  renderedCanvasEl: HTMLCanvasElement,
  renderedCanvasCtx: CanvasRenderingContext2D,
  offscreenCanvasEl: HTMLCanvasElement,
  offscreenCanvasCtx: CanvasRenderingContext2D,
  offscreenVideoEl: HTMLVideoElement,
  stream: MediaStream,
  cols: number,
  rows: number;

async function init() {
  rootEl = document.getElementById("__root__")!;

  if (!rootEl) {
    throw new Error("Root element not found");
  }

  renderedCanvasEl = document.createElement("canvas");
  renderedCanvasEl.classList.add("size-full", "bg-black");
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

  renderedCanvasEl.height = renderedCanvasEl.clientHeight;
  renderedCanvasEl.width = renderedCanvasEl.clientWidth;

  cols = Math.floor(renderedCanvasEl.width / CHAR_WIDTH);
  rows = Math.floor(renderedCanvasEl.height / CHAR_HEIGHT);

  offscreenCanvasEl.height = rows;
  offscreenCanvasEl.width = cols;

  renderedCanvasCtx.font = `${FONT_SIZE}px monospace`;
  renderedCanvasCtx.textBaseline = "top";

  stream = await navigator.mediaDevices.getUserMedia({
    video: true,
  });

  offscreenVideoEl = document.createElement("video");
  offscreenVideoEl.srcObject = stream;
  offscreenVideoEl.playsInline = true;
  offscreenVideoEl.muted = true;

  await offscreenVideoEl.play();
}

function loop() {
  const image = renderOffscreen();
  renderAscii(image);

  requestAnimationFrame(loop);
}

function renderOffscreen(): ImageData {
  renderedCanvasCtx.clearRect(
    0,
    0,
    renderedCanvasEl.width,
    renderedCanvasEl.height,
  );

  offscreenCanvasCtx.drawImage(
    offscreenVideoEl,
    0,
    0,
    offscreenCanvasEl.width,
    offscreenCanvasEl.height,
  );

  const image = offscreenCanvasCtx.getImageData(
    0,
    0,
    offscreenCanvasEl.width,
    offscreenCanvasEl.height,
  );

  return image;
}

function renderAscii(image: ImageData) {
  for (let i = 0; i < image.data.length; i += 4) {
    const r = image.data[i + 0],
      g = image.data[i + 1],
      b = image.data[i + 2],
      luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b,
      charIndex = Math.floor((luminance / 255) * (ASCII_CHARS.length - 1)),
      char = ASCII_CHARS[charIndex],
      pixelIndex = i / 4,
      pixelX = (pixelIndex % cols) * CHAR_WIDTH,
      pixelY = Math.floor(pixelIndex / cols) * CHAR_HEIGHT;

    renderedCanvasCtx.fillStyle = `#fff`;
    renderedCanvasCtx.fillText(char, pixelX, pixelY);
  }
}

await init();
loop();
