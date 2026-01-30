import "./styles/global.css";

let running: boolean = false,
  rootEl: HTMLElement,
  canvasEl: HTMLCanvasElement,
  videoEl: HTMLVideoElement,
  ctx: CanvasRenderingContext2D,
  stream: MediaStream;

async function init() {
  rootEl = document.getElementById("__root__")!;

  if (!rootEl) {
    throw new Error("Root element not found");
  }

  canvasEl = document.createElement("canvas");
  canvasEl.classList.add("size-full");
  rootEl.appendChild(canvasEl);

  ctx = canvasEl.getContext("2d")!;

  if (!ctx) {
    throw new Error("Canvas context not found");
  }

  // TODO: esse valor precisa ser "reativo", ele precisa ser recalculado conforme se muda o tamanho do canvas
  canvasEl.height = canvasEl.clientHeight;
  canvasEl.width = canvasEl.clientWidth;

  stream = await navigator.mediaDevices.getUserMedia({
    video: true,
  });

  videoEl = document.createElement("video");
  videoEl.srcObject = stream;
  videoEl.playsInline = true;
  videoEl.muted = true;

  await videoEl.play();
}

function start() {
  if (running) return;
  running = true;
  requestAnimationFrame(loop);
}

function render() {
  console.log(videoEl);
  ctx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);
}

function loop() {
  render();
  requestAnimationFrame(loop);
}

async function bootstrap() {
  await init();
  start();
}

bootstrap();
