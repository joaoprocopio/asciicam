import { makeEventListener } from "@solid-primitives/event-listener";
import { createEffect, createResource, onCleanup, onMount } from "solid-js";

import { createCharAtlas, CHAR_WIDTH, CHAR_HEIGHT, NUM_CHARS } from "./atlas";
import { VERTEX_SOURCE, FRAGMENT_SOURCE } from "./shaders";

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compile error: ${info}`);
  }

  return shader;
}

function createProgram(
  gl: WebGL2RenderingContext,
  vertSrc: string,
  fragSrc: string,
): WebGLProgram {
  const vert = compileShader(gl, gl.VERTEX_SHADER, vertSrc);
  const frag = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc);

  const program = gl.createProgram()!;
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Program link error: ${info}`);
  }

  // Shaders are baked into the program now; safe to delete
  gl.deleteShader(vert);
  gl.deleteShader(frag);

  return program;
}

function createTexture(
  gl: WebGL2RenderingContext,
  unit: number,
): WebGLTexture {
  const tex = gl.createTexture()!;
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  // Clamp to edge + nearest filtering (we want pixel-perfect glyphs)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  return tex;
}

export function Root() {
  const [camera] = createResource(() =>
    navigator.mediaDevices.getUserMedia({ video: true }),
  );

  let canvasEl!: HTMLCanvasElement;
  let gl!: WebGL2RenderingContext;
  let program!: WebGLProgram;
  let videoTex!: WebGLTexture;
  let rafId = 0;

  // Uniform locations (cached after program creation)
  let uResolution!: WebGLUniformLocation;
  let uCharSize!: WebGLUniformLocation;
  let uNumChars!: WebGLUniformLocation;
  let uVideo!: WebGLUniformLocation;
  let uAtlas!: WebGLUniformLocation;

  const videoEl: HTMLVideoElement = document.createElement("video");

  function updateUniforms() {
    gl.viewport(0, 0, canvasEl.width, canvasEl.height);
    gl.uniform2f(uResolution, canvasEl.width, canvasEl.height);
  }

  function render() {
    // Upload the current video frame to the GPU
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, videoTex);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGB,
      gl.RGB,
      gl.UNSIGNED_BYTE,
      videoEl,
    );

    gl.drawArrays(gl.TRIANGLES, 0, 3);
    rafId = requestAnimationFrame(render);
  }

  onMount(() => {
    gl = canvasEl.getContext("webgl2")!;
    if (!gl) throw new Error("WebGL2 not supported");

    // --- Shader program ---
    program = createProgram(gl, VERTEX_SOURCE, FRAGMENT_SOURCE);
    gl.useProgram(program);

    // --- Uniform locations ---
    uResolution = gl.getUniformLocation(program, "u_resolution")!;
    uCharSize = gl.getUniformLocation(program, "u_charSize")!;
    uNumChars = gl.getUniformLocation(program, "u_numChars")!;
    uVideo = gl.getUniformLocation(program, "u_video")!;
    uAtlas = gl.getUniformLocation(program, "u_atlas")!;

    // --- Static uniforms ---
    gl.uniform2f(uCharSize, CHAR_WIDTH, CHAR_HEIGHT);
    gl.uniform1f(uNumChars, NUM_CHARS);
    gl.uniform1i(uVideo, 0); // texture unit 0
    gl.uniform1i(uAtlas, 1); // texture unit 1

    // --- Video texture (unit 0) ---
    videoTex = createTexture(gl, 0);
    // Upload a 1x1 black pixel as placeholder until the video starts
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGB,
      1,
      1,
      0,
      gl.RGB,
      gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 0]),
    );

    // --- Atlas texture (unit 1) ---
    const atlasTex = createTexture(gl, 1);
    const atlasCanvas = createCharAtlas();
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      atlasCanvas,
    );

    // --- Empty VAO (vertex-less fullscreen triangle) ---
    const vao = gl.createVertexArray()!;
    gl.bindVertexArray(vao);

    // --- Initial sizing ---
    canvasEl.width = window.innerWidth;
    canvasEl.height = window.innerHeight;
    updateUniforms();

    // --- Resize handler ---
    makeEventListener(
      window,
      "resize",
      () => {
        canvasEl.width = window.innerWidth;
        canvasEl.height = window.innerHeight;
        updateUniforms();
      },
      { passive: true },
    );

    // --- Start render loop ---
    rafId = requestAnimationFrame(render);
  });

  onCleanup(() => {
    cancelAnimationFrame(rafId);
  });

  createEffect(async () => {
    const stream = camera();
    if (!stream) return;

    videoEl.srcObject = stream;
    videoEl.playsInline = true;
    videoEl.muted = true;
    await videoEl.play();
  });

  return <canvas class="size-full bg-black" ref={canvasEl!} />;
}
