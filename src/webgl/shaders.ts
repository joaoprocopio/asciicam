export const VERTEX_SOURCE = /* glsl */ `#version 300 es

out vec2 vUV;

void main() {
  float x = float((gl_VertexID & 1) * 2 - 1);
  float y = float((gl_VertexID >> 1) * 2 - 1);
  gl_Position = vec4(x, y, 0.0, 1.0);
  vUV = vec2(x * 0.5 + 0.5, 1.0 - (y * 0.5 + 0.5));
}
`;

export const FRAGMENT_SOURCE = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUV;
out vec4 fragColor;

uniform sampler2D uVideo;
uniform sampler2D uAtlas;
uniform vec2 uResolution;
uniform vec2 uCellSize;
uniform float uCharCount;
uniform vec2 uAtlasGrid;

void main() {
  vec2 pixelCoord = vUV * uResolution;
  vec2 cellIndex = floor(pixelCoord / uCellSize);
  vec2 cellLocal = mod(pixelCoord, uCellSize);
  vec2 gridSize = floor(uResolution / uCellSize);

  vec2 videoUV = (cellIndex + 0.5) / gridSize;
  vec4 videoColor = texture(uVideo, videoUV);

  float lum = 0.2126 * videoColor.r + 0.7152 * videoColor.g + 0.0722 * videoColor.b;

  float charIndex = floor(lum * (uCharCount - 1.0));
  charIndex = clamp(charIndex, 0.0, uCharCount - 1.0);

  float glyphCol = mod(charIndex, uAtlasGrid.x);
  float glyphRow = floor(charIndex / uAtlasGrid.x);

  vec2 glyphOrigin = vec2(glyphCol, glyphRow) / uAtlasGrid;
  vec2 cellFraction = cellLocal / uCellSize;
  vec2 atlasUV = glyphOrigin + cellFraction / uAtlasGrid;

  float glyphAlpha = texture(uAtlas, atlasUV).r;

  fragColor = vec4(vec3(glyphAlpha), 1.0);
}
`;
