export const VERTEX_SOURCE = /* glsl */ `#version 300 es
precision highp float;

// Fullscreen triangle (covers the viewport with a single triangle, no VBO needed)
// Vertex IDs 0, 1, 2 produce clip-space positions that cover [-1,1] x [-1,1].
void main() {
  float x = float((gl_VertexID & 1) << 2) - 1.0;
  float y = float((gl_VertexID & 2) << 1) - 1.0;
  gl_Position = vec4(x, y, 0.0, 1.0);
}
`;

export const FRAGMENT_SOURCE = /* glsl */ `#version 300 es
precision highp float;

uniform sampler2D u_video;
uniform sampler2D u_atlas;

uniform vec2 u_resolution;   // canvas size in pixels
uniform vec2 u_charSize;     // CHAR_WIDTH, CHAR_HEIGHT
uniform float u_numChars;    // number of chars in the atlas

out vec4 fragColor;

void main() {
  // Flip Y so row 0 is at the top (screen convention)
  vec2 coord = vec2(gl_FragCoord.x, u_resolution.y - gl_FragCoord.y);

  // Which ASCII cell does this pixel belong to?
  vec2 cell = floor(coord / u_charSize);

  // Grid dimensions (how many cells fit on screen)
  vec2 gridSize = floor(u_resolution / u_charSize);

  // Sample the video texture at the cell's center.
  // Mirror horizontally so it feels like a mirror/selfie cam.
  vec2 videoUV = (cell + 0.5) / gridSize;
  videoUV.x = 1.0 - videoUV.x;

  vec3 rgb = texture(u_video, videoUV).rgb;

  // Luminance (ITU-R BT.709)
  float lum = dot(rgb, vec3(0.2126, 0.7152, 0.0722));

  // Map luminance to a character index
  float charIdx = floor(lum * (u_numChars - 1.0));

  // Local position within the character cell [0, 1)
  vec2 localPos = fract(coord / u_charSize);

  // Atlas UV: the atlas is a single row of glyphs, each CHAR_WIDTH wide
  float atlasU = (charIdx + localPos.x) / u_numChars;
  float atlasV = localPos.y;

  float glyph = texture(u_atlas, vec2(atlasU, atlasV)).r;

  fragColor = vec4(vec3(glyph), 1.0);
}
`;
