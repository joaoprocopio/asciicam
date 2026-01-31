import "./styles/global.css";

const ASCII_CHARS =
    "`.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@",
  COLOR_SPACE = "srgb" satisfies PredefinedColorSpace,
  FONT_SIZE = 8,
  CHAR_WIDTH = 8,
  CHAR_HEIGHT = 10;

let rootEl: HTMLElement,
  canvasEl: HTMLCanvasElement,
  canvasCtx: CanvasRenderingContext2D,
  bufferEl: HTMLCanvasElement,
  bufferCtx: CanvasRenderingContext2D,
  videoEl: HTMLVideoElement,
  stream: MediaStream,
  cols: number,
  rows: number;

async function init() {
  rootEl = document.getElementById("__root__")!;

  if (!rootEl) {
    throw new Error("Root element not found");
  }

  canvasEl = document.createElement("canvas");
  canvasEl.classList.add("size-full", "bg-black");
  rootEl.appendChild(canvasEl);

  canvasCtx = canvasEl.getContext("2d", {
    colorSpace: COLOR_SPACE,
  })!;

  bufferEl = document.createElement("canvas");
  bufferCtx = bufferEl.getContext("2d", {
    willReadFrequently: true,
    colorSpace: COLOR_SPACE,
  })!;

  if (!canvasCtx || !bufferCtx) {
    throw new Error("Canvas context not found");
  }

  canvasEl.height = canvasEl.clientHeight;
  canvasEl.width = canvasEl.clientWidth;

  cols = Math.floor(canvasEl.width / CHAR_WIDTH);
  rows = Math.floor(canvasEl.height / CHAR_HEIGHT);

  bufferEl.height = rows;
  bufferEl.width = cols;

  canvasCtx.font = `${FONT_SIZE}px monospace`;
  canvasCtx.textBaseline = "top";

  stream = await navigator.mediaDevices.getUserMedia({
    video: true,
  });

  videoEl = document.createElement("video");
  videoEl.srcObject = stream;
  videoEl.playsInline = true;
  videoEl.muted = true;

  await videoEl.play();
}

function loop() {
  const image = renderOffscreen();
  renderAscii(image);
  requestAnimationFrame(loop);
}

function renderOffscreen(): ImageData {
  canvasCtx.clearRect(0, 0, canvasEl.width, canvasEl.height);

  bufferCtx.drawImage(videoEl, 0, 0, bufferEl.width, bufferEl.height);

  const image = bufferCtx.getImageData(0, 0, bufferEl.width, bufferEl.height);

  return image;
}

function renderAscii(image: ImageData) {
  for (let i = 0; i < image.data.length; i += 4) {
    const luminance =
        0.2126 * image.data[i + 0] +
        0.7152 * image.data[i + 1] +
        0.0722 * image.data[i + 2],
      charIndex = Math.floor((luminance / 255) * (ASCII_CHARS.length - 1)),
      char = ASCII_CHARS[charIndex],
      pixelIndex = i / 4,
      pixelX = (pixelIndex % cols) * CHAR_WIDTH,
      pixelY = Math.floor(pixelIndex / cols) * CHAR_HEIGHT;

    canvasCtx.fillStyle = `#fff`;
    canvasCtx.fillText(char, pixelX, pixelY);
  }
}

await init();
loop();
