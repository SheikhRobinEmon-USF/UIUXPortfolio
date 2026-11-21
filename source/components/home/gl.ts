/**
 * Minimal WebGL renderer for the project slider. Each project is a
 * subdivided plane; the vertex shader bends it with scroll velocity and the
 * fragment shader adds an RGB split and a pointer ripple. No dependencies.
 */

export type Plane = {
  x: number; // centre, px from viewport centre
  y: number;
  w: number;
  h: number;
  alpha: number;
  gray: number; // 0..1 desaturation for inactive planes
  hover: number; // 0..1
};

const VERT = `
attribute vec2 aPos;
uniform vec2 uView;
uniform vec2 uCenter;
uniform vec2 uSize;
uniform float uVel;
uniform float uVelX;
varying vec2 vUv;
varying float vBend;
void main() {
  vUv = aPos;
  vec2 p = (aPos - 0.5) * uSize;
  float nx = (aPos.x - 0.5) * 2.0;
  float ny = (aPos.y - 0.5) * 2.0;
  float bend = (1.0 - nx * nx);
  float bendX = (1.0 - ny * ny);
  p.y += uVel * bend * uSize.y * 0.22;
  p.x += uVelX * bendX * uSize.x * 0.12;
  vBend = bend * abs(uVel) + bendX * abs(uVelX);
  vec2 pos = uCenter + p;
  gl_Position = vec4(pos.x / (uView.x * 0.5), -pos.y / (uView.y * 0.5), 0.0, 1.0);
}`;

const FRAG = `
precision mediump float;
uniform sampler2D uTex;
uniform vec2 uCover;
uniform float uVel;
uniform float uAlpha;
uniform float uGray;
uniform float uTime;
uniform vec2 uMouse;
uniform float uHover;
varying vec2 vUv;
varying float vBend;
void main() {
  vec2 uv = vUv;
  vec2 dir = uv - uMouse;
  float d = length(dir);
  float ripple = sin(d * 38.0 - uTime * 3.2) * 0.0055 * uHover * smoothstep(0.45, 0.0, d);
  uv += normalize(dir + 1e-4) * ripple;
  vec2 st = (uv - 0.5) * uCover + 0.5;
  // gentle zoom toward the pointer while hovering
  st = mix(st, (st - uMouse) * 0.96 + uMouse, uHover * 0.6);
  float shift = clamp(uVel, -1.0, 1.0) * 0.018;
  float r = texture2D(uTex, st + vec2(0.0, shift)).r;
  vec2 gb = texture2D(uTex, st).gb;
  float b2 = texture2D(uTex, st - vec2(0.0, shift)).b;
  vec3 col = vec3(r, gb.x, mix(gb.y, b2, 0.8));
  float l = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(col, vec3(l) * 0.75, uGray);
  col *= 1.0 - vBend * 0.25;
  gl_FragColor = vec4(col * uAlpha, uAlpha);
}`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || "shader");
  return s;
}

export class SliderGL {
  gl: WebGLRenderingContext;
  prog: WebGLProgram;
  count: number;
  textures: (WebGLTexture | null)[] = [];
  aspects: number[] = [];
  loc: Record<string, WebGLUniformLocation | null> = {};
  dpr = 1;
  w = 0;
  h = 0;

  constructor(public canvas: HTMLCanvasElement, sources: string[], onProgress: (loaded: number) => void) {
    const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: true });
    if (!gl) throw new Error("no webgl");
    this.gl = gl;
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error("link");
    this.prog = prog;
    gl.useProgram(prog);

    // 24 × 24 subdivided unit plane as a triangle list
    const N = 24;
    const verts: number[] = [];
    for (let y = 0; y < N; y++)
      for (let x = 0; x < N; x++) {
        const a = [x / N, y / N], b = [(x + 1) / N, y / N], c = [x / N, (y + 1) / N], d = [(x + 1) / N, (y + 1) / N];
        verts.push(...a, ...b, ...c, ...c, ...b, ...d);
      }
    this.count = verts.length / 2;
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    for (const n of ["uView", "uCenter", "uSize", "uVel", "uVelX", "uTex", "uCover", "uAlpha", "uGray", "uTime", "uMouse", "uHover"])
      this.loc[n] = gl.getUniformLocation(prog, n);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    let loaded = 0;
    sources.forEach((src, i) => {
      this.textures[i] = null;
      this.aspects[i] = 2;
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        const t = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, t);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        this.textures[i] = t;
        this.aspects[i] = img.naturalWidth / img.naturalHeight;
        onProgress(++loaded);
      };
      img.onerror = () => onProgress(++loaded);
      img.src = src;
    });
  }

  resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = this.canvas.getBoundingClientRect();
    this.w = r.width;
    this.h = r.height;
    this.canvas.width = Math.round(r.width * this.dpr);
    this.canvas.height = Math.round(r.height * this.dpr);
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  draw(planes: Plane[], vel: number, velX: number, time: number, mouse: [number, number][]) {
    const { gl, loc } = this;
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(loc.uView, this.w, this.h);
    gl.uniform1f(loc.uVel, vel);
    gl.uniform1f(loc.uVelX, velX);
    gl.uniform1f(loc.uTime, time);
    planes.forEach((p, i) => {
      const t = this.textures[i];
      if (!t || p.alpha <= 0.002) return;
      // offset from canvas centre (canvas may not be centred in viewport)
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.uniform1i(loc.uTex, 0);
      gl.uniform2f(loc.uCenter, p.x, p.y);
      gl.uniform2f(loc.uSize, p.w, p.h);
      const planeAspect = p.w / p.h;
      const ta = this.aspects[i];
      // "object-fit: cover" scale for the texture coordinates
      gl.uniform2f(loc.uCover, planeAspect > ta ? 1 : planeAspect / ta, planeAspect > ta ? ta / planeAspect : 1);
      gl.uniform1f(loc.uAlpha, p.alpha);
      gl.uniform1f(loc.uGray, p.gray);
      gl.uniform2f(loc.uMouse, mouse[i]?.[0] ?? 0.5, mouse[i]?.[1] ?? 0.5);
      gl.uniform1f(loc.uHover, p.hover);
      gl.drawArrays(gl.TRIANGLES, 0, this.count);
    });
  }

  destroy() {
    this.textures.forEach((t) => t && this.gl.deleteTexture(t));
    this.gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
}
