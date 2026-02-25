import { VERTEX_SOURCE, FRAGMENT_SOURCE } from "./shaders";

export interface RendererOptions {
  canvas: HTMLCanvasElement;
  atlasCanvas: OffscreenCanvas;
  atlasGrid: { cols: number; rows: number };
  charCount: number;
  cellWidth: number;
  cellHeight: number;
}

export interface Renderer {
  renderFrame(video: HTMLVideoElement): void;
  resize(width: number, height: number): void;
  destroy(): void;
}

function compileShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compile error: ${log}`);
  }

  return shader;
}

function createProgram(gl: WebGL2RenderingContext, vertSrc: string, fragSrc: string) {
  const vert = compileShader(gl, gl.VERTEX_SHADER, vertSrc);
  const frag = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc);

  const program = gl.createProgram()!;
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Program link error: ${log}`);
  }

  gl.deleteShader(vert);
  gl.deleteShader(frag);

  return program;
}

export function createRenderer(opts: RendererOptions): Renderer {
  const { canvas, atlasCanvas, atlasGrid, charCount, cellWidth, cellHeight } = opts;

  const gl = canvas.getContext("webgl2", { antialias: false, alpha: false })!;
  if (!gl) throw new Error("WebGL2 not supported");

  const program = createProgram(gl, VERTEX_SOURCE, FRAGMENT_SOURCE);
  gl.useProgram(program);

  // Uniforms
  const uVideo = gl.getUniformLocation(program, "uVideo");
  const uAtlas = gl.getUniformLocation(program, "uAtlas");
  const uResolution = gl.getUniformLocation(program, "uResolution");
  const uCellSize = gl.getUniformLocation(program, "uCellSize");
  const uCharCount = gl.getUniformLocation(program, "uCharCount");
  const uAtlasGrid = gl.getUniformLocation(program, "uAtlasGrid");

  // Empty VAO (required by WebGL2)
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  // Video texture (TEXTURE0)
  const videoTex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, videoTex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  // Atlas texture (TEXTURE1)
  const atlasTex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, atlasTex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlasCanvas);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  // Static uniforms
  gl.uniform1i(uVideo, 0);
  gl.uniform1i(uAtlas, 1);
  gl.uniform2f(uCellSize, cellWidth, cellHeight);
  gl.uniform1f(uCharCount, charCount);
  gl.uniform2f(uAtlasGrid, atlasGrid.cols, atlasGrid.rows);
  gl.uniform2f(uResolution, canvas.width, canvas.height);

  return {
    renderFrame(video: HTMLVideoElement) {
      if (video.readyState < video.HAVE_CURRENT_DATA) return;

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, videoTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },

    resize(width: number, height: number) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
      gl.useProgram(program);
      gl.uniform2f(uResolution, width, height);
    },

    destroy() {
      gl.deleteTexture(videoTex);
      gl.deleteTexture(atlasTex);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(program);
    },
  };
}
