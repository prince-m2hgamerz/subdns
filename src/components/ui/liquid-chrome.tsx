"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface LiquidChromeProps {
  /** Additional CSS classes for custom styling */
  className?: string;
  /** Base color tint for the chrome. Default is near-black. Use normalized RGB (0-1). */
  baseColor?: [number, number, number];
  /** Animation speed multiplier. Default is 1.0 */
  speed?: number;
  /** Detail level of the fluid waves. Higher is more detailed. Default is 0.6 */
  amplitude?: number;
  /** Enables mouse interaction if true */
  interactive?: boolean;
  /** Strength of the cursor distortion effect. Default is 0.35 */
  distortionStrength?: number;
  /**
   * Internal render resolution as a fraction of the element's CSS size
   * (before the devicePixelRatio multiplier). Lower = cheaper per-pixel
   * shader cost = better FPS, at a small cost to sharpness on very large
   * canvases. Default is 0.75.
   */
  renderScale?: number;
  /**
   * How quickly the distortion catches up to the real cursor position, in
   * milliseconds. Lower = snappier/less delay, higher = more trailing/lag.
   * Default is 80.
   */
  mouseSmoothingMs?: number;
}

const vertexShaderSource = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
  precision highp float;

  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec2 u_mouse;
  uniform vec3 u_baseColor;
  uniform float u_amplitude;
  uniform float u_distortionStrength;

  // Simple 2D noise
  const mat2 m = mat2( 0.80,  0.60, -0.60,  0.80 );

  float hash( vec2 p ) {
      float h = dot(p,vec2(127.1,311.7));
      return fract(sin(h)*43758.5453123);
  }

  float noise( in vec2 p ) {
      vec2 i = floor( p );
      vec2 f = fract( p );
      vec2 u = f*f*(3.0-2.0*f);
      return mix( mix( hash( i + vec2(0.0,0.0) ), 
                       hash( i + vec2(1.0,0.0) ), u.x),
                  mix( hash( i + vec2(0.0,1.0) ), 
                       hash( i + vec2(1.0,1.0) ), u.x), u.y);
  }

  // 3 octaves instead of 4 — the 4th added little visible detail but cost
  // a full extra noise() (4 hash() calls) per fbm() invocation, and fbm()
  // is called 5 times per pixel, so this alone is a meaningful GPU saving.
  float fbm( vec2 p ) {
      float f = 0.0;
      f += 0.5000*noise( p ); p = m*p*2.02;
      f += 0.2500*noise( p ); p = m*p*2.03;
      f += 0.1250*noise( p );
      return f/0.875;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 p = -1.0 + 2.0 * uv;
    if (u_resolution.y > 0.0) {
        p.x *= u_resolution.x / u_resolution.y;
    }

    // Mouse interaction
    vec2 mouse = (u_mouse - 0.5) * 2.0;
    if (u_resolution.y > 0.0) {
        mouse.x *= u_resolution.x / u_resolution.y;
    }
    
    // Distort based on distance to mouse
    vec2 diff = p - mouse;
    float dist = length(diff);
    vec2 distortion = vec2(0.0);
    if (dist > 0.0) {
        distortion = (diff / dist) * exp(-dist * 3.0) * u_distortionStrength;
    }
    p += distortion;

    float time = u_time * 0.5;

    // Domain warping
    vec2 q = vec2(0.0);
    q.x = fbm(p + vec2(0.0, 0.0) + time * 0.1);
    q.y = fbm(p + vec2(5.2, 1.3) + time * 0.15);

    vec2 r = vec2(0.0);
    r.x = fbm(p + 4.0 * q + vec2(1.7, 9.2) + time * 0.2);
    r.y = fbm(p + 4.0 * q + vec2(8.3, 2.8) + time * 0.25);

    float f = fbm(p + r * 4.0 * u_amplitude);

    // Color mixing (Chrome / Liquid Metal style)
    vec3 col = u_baseColor;
    
    // Add bright highlights based on the warped noise
    float highlight = smoothstep(0.4, 0.6, f);
    float highlight2 = smoothstep(0.6, 0.8, f);
    float dark = smoothstep(0.1, 0.3, f);
    
    col = mix(col, vec3(0.0), 1.0 - dark); // add shadows
    col = mix(col, vec3(0.8, 0.8, 0.9), highlight); // add silver midtones
    col = mix(col, vec3(1.0, 1.0, 1.0), highlight2); // add bright white specular
    
    // Vignette
    float v = 16.0 * uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y);
    col *= 0.5 + 0.5 * pow(max(0.0, v), 0.2);

    gl_FragColor = vec4(col, 1.0);
  }
`;

export function LiquidChrome({
  className,
  baseColor = [0.1, 0.1, 0.1],
  speed = 1.0,
  amplitude = 0.6,
  interactive = true,
  distortionStrength = 0.35,
  renderScale = 0.75,
  mouseSmoothingMs = 80,
}: LiquidChromeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colorRef = useRef(baseColor);
  colorRef.current = baseColor;
  const speedRef = useRef(speed);
  speedRef.current = speed;
  const amplitudeRef = useRef(amplitude);
  amplitudeRef.current = amplitude;
  const interactiveRef = useRef(interactive);
  interactiveRef.current = interactive;
  const distortionRef = useRef(distortionStrength);
  distortionRef.current = distortionStrength;
  const renderScaleRef = useRef(renderScale);
  renderScaleRef.current = renderScale;
  const smoothingRef = useRef(mouseSmoothingMs);
  smoothingRef.current = mouseSmoothingMs;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      antialias: true,
      // Depth/stencil not used for a fullscreen quad shader; skip them.
      depth: false,
      stencil: false,
    });
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    let program: WebGLProgram | null = null;
    let vertexShader: WebGLShader | null = null;
    let fragmentShader: WebGLShader | null = null;
    let positionBuffer: WebGLBuffer | null = null;

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const setup = () => {
      vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
      fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
      if (!vertexShader || !fragmentShader) return false;

      program = gl.createProgram()!;
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Program link error:", gl.getProgramInfoLog(program));
        return false;
      }
      gl.useProgram(program);

      // Shaders are linked into the program now; free the standalone objects.
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      vertexShader = null;
      fragmentShader = null;

      positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
        gl.STATIC_DRAW
      );

      const positionLocation = gl.getAttribLocation(program, "position");
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      return true;
    };

    if (!setup()) return;

    const getUniforms = () => ({
      resolution: gl.getUniformLocation(program!, "u_resolution"),
      time: gl.getUniformLocation(program!, "u_time"),
      mouse: gl.getUniformLocation(program!, "u_mouse"),
      baseColor: gl.getUniformLocation(program!, "u_baseColor"),
      amplitude: gl.getUniformLocation(program!, "u_amplitude"),
      distortion: gl.getUniformLocation(program!, "u_distortionStrength"),
    });
    let uniforms = getUniforms();

    // Target = where the cursor actually is. mouse = the smoothed value we
    // actually feed the shader, eased toward target every frame so the
    // distortion trails behind the cursor instead of snapping to it.
    let mouseTarget: [number, number] = [0.5, 0.5];
    let mouse: [number, number] = [0.5, 0.5];

    let animationFrameId: number;
    // Accumulated (not wall-clock) time, so pausing while off-screen or
    // backgrounded never causes the pattern to jump forward on resume.
    let accumulatedTime = 0;
    let lastFrameTime = performance.now();
    let isVisible = true;

    // DPR-aware resize so the canvas backing store matches display size.
    // Without this, u_resolution can be wrong relative to the mouse's
    // CSS-pixel coordinate space, causing distortion to misalign.
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      // Cap DPR at 1.5 (not 2) and additionally scale by renderScale.
      // Fragment shader cost is O(pixels), and this fbm-heavy shader is
      // the actual source of "laggy" FPS on large canvases — the fix is
      // fewer pixels, not just fewer octaves. The canvas's CSS size is
      // unaffected; the GPU just upscales the smaller buffer, which reads
      // as a soft blur rather than pixelation on a fluid pattern like this.
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const scale = dpr * renderScaleRef.current;
      const width = Math.max(1, Math.round(rect.width * scale));
      const height = Math.max(1, Math.round(rect.height * scale));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
    };

    const updateMouseFromClient = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      mouseTarget[0] = (clientX - rect.left) / rect.width;
      mouseTarget[1] = 1.0 - (clientY - rect.top) / rect.height;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactiveRef.current) return;
      updateMouseFromClient(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!interactiveRef.current) return;
      const touch = e.touches[0];
      if (!touch) return;
      updateMouseFromClient(touch.clientX, touch.clientY);
    };

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(animationFrameId);
    };

    const handleContextRestored = () => {
      if (setup()) {
        uniforms = getUniforms();
        lastFrameTime = performance.now();
        resize();
        animationFrameId = requestAnimationFrame(render);
      }
    };

    canvas.addEventListener("webglcontextlost", handleContextLost, false);
    canvas.addEventListener(
      "webglcontextrestored",
      handleContextRestored,
      false
    );

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) lastFrameTime = performance.now();
      },
      { threshold: 0.01 }
    );
    observer.observe(canvas);

    // ResizeObserver watches the canvas's own box, not just the window, so
    // layout changes from flex/grid reflow etc. keep u_resolution in sync.
    const resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(canvas);

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    resize();

    const render = (time: number) => {
      let dt = time - lastFrameTime;
      lastFrameTime = time;
      // Clamp large gaps (tab switch, dropped frames) so resuming never
      // looks like the fluid teleported forward in time.
      dt = Math.min(dt, 100);

      if (isVisible) {
        accumulatedTime += dt * 0.001 * speedRef.current;

        // Frame-rate independent easing toward the real cursor position.
        // Expressed as a true time constant (ms) rather than a decay-per-
        // second magic number, so "delay" is directly tunable: after
        // `mouseSmoothingMs` the gap to the real cursor has closed ~63%,
        // after 3x that it's essentially caught up. Default 80ms reaches
        // that point in ~240ms — smoothed, but not laggy.
        const tau = Math.max(1, smoothingRef.current);
        const ease = 1 - Math.exp(-dt / tau);
        mouse[0] += (mouseTarget[0] - mouse[0]) * ease;
        mouse[1] += (mouseTarget[1] - mouse[1]) * ease;

        gl.uniform1f(uniforms.time, accumulatedTime);
        gl.uniform2f(uniforms.mouse, mouse[0], mouse[1]);
        gl.uniform3f(
          uniforms.baseColor,
          colorRef.current[0],
          colorRef.current[1],
          colorRef.current[2]
        );
        gl.uniform1f(uniforms.amplitude, amplitudeRef.current);
        gl.uniform1f(uniforms.distortion, distortionRef.current);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      canvas.removeEventListener(
        "webglcontextrestored",
        handleContextRestored
      );
      cancelAnimationFrame(animationFrameId);

      // Release GPU resources explicitly instead of leaking them.
      if (positionBuffer) gl.deleteBuffer(positionBuffer);
      if (program) gl.deleteProgram(program);
      if (vertexShader) gl.deleteShader(vertexShader);
      if (fragmentShader) gl.deleteShader(fragmentShader);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={cn("w-full h-full block", className)}
      style={{ touchAction: "none" }}
    />
  );
}