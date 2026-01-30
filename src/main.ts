import "./styles/global.css";

const ASCII_CHARS =
  "@&%QWNM0gB$#DR8mHXKAUbGOpV4d9h6PkqwSE2]ayjxY5Zoen[ult13If}C{iF|(7J)vTLs?z/*cr!+<>;=^,_:'-.`";

const rootEl = document.getElementById("__root__");

if (!rootEl) {
  throw new Error("Root element not found");
}

const stream = await navigator.mediaDevices.getUserMedia({
  video: true,
});

const videoEl = document.createElement("video");
videoEl.classList.add("size-full");
videoEl.srcObject = stream;
videoEl.addEventListener("loadedmetadata", () => {
  videoEl.play();
});

rootEl.appendChild(videoEl);
