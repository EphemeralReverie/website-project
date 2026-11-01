"use client";

import { useEffect, useRef } from "react";

const VERTEX = `
attribute vec2 a_position;
void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
`;

// Soft blurred colour glows over a dark slate base, with film grain.
// (Matches the reference: dark slate-blue left, periwinkle glow lower-right,
// mauve haze top-right.) The glows drift very slowly.
const FRAGMENT = `
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

// Smooth gaussian-like glow. Distances are aspect-corrected so blobs stay round.
float glow(vec2 uv, vec2 c, vec2 radius, float aspect) {
  vec2 d = (uv - c) * vec2(aspect, 1.0) / radius;
  return exp(-dot(d, d));
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float aspect = u_resolution.x / u_resolution.y;
  float t = u_time * 0.12;

  vec3 base     = vec3(0.165, 0.178, 0.255); // dark slate-blue  (#2a2d41)
  vec3 periwink = vec3(0.420, 0.390, 0.800); // periwinkle        (#6b63cc)
  vec3 mauve    = vec3(0.600, 0.520, 0.600); // dusty mauve       (#998599)
  vec3 deep     = vec3(0.090, 0.098, 0.165); // shadow, far left

  // large, slowly drifting glow centres (uv, y up)
  vec2 c1 = vec2(0.70 + 0.05 * sin(t),        0.32 + 0.05 * cos(t * 0.8));
  vec2 c2 = vec2(0.78 + 0.05 * cos(t * 0.7),  0.98 + 0.04 * sin(t * 0.9));
  vec2 c3 = vec2(0.92 + 0.03 * sin(t * 0.6),  0.12 + 0.04 * cos(t));

  float g1 = glow(uv, c1, vec2(0.46, 0.50), aspect * 0.62);
  float g2 = glow(uv, c2, vec2(0.40, 0.34), aspect * 0.62);
  float g3 = glow(uv, c3, vec2(0.40, 0.40), aspect * 0.62);

  vec3 col = base;
  col = mix(col, deep, smoothstep(0.55, 0.0, uv.x) * 0.45);
  col = mix(col, periwink, clamp(g1 * 0.95 + g3 * 0.75, 0.0, 1.0));
  col = mix(col, mauve, clamp(g2 * 0.85, 0.0, 1.0));

  // fine film grain (refreshes ~8x/sec so it feels alive but calm)
  float n = hash(gl_FragCoord.xy + floor(u_time * 8.0) * 17.0) - 0.5;
  col += n * 0.075;

  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export interface ShaderBackgroundProps {
  className?: string;
}

export function ShaderBackground({ className }: ShaderBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) return; // no WebGL: the page's bg-slate-950 shows through

    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram();
    if (!vs || !fs || !program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const loc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "u_resolution");
    const uTime = gl.getUniformLocation(program, "u_time");

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();
    let raf = 0;

    const draw = (now: number) => {
      resize();
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, reduceMotion ? 20 : (now - start) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      if (!reduceMotion && !document.hidden) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    const onVisibility = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(draw);
    };
    document.addEventListener("visibilitychange", onVisibility);
    const ro = new ResizeObserver(() => {
      if (reduceMotion) raf = requestAnimationFrame(draw);
    });
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
      ro.disconnect();
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buffer);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}

export default ShaderBackground;
