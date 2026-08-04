import { useRef, useEffect, useState, useMemo } from "react";
import * as THREE from "three";

const VERTEX_SHADER = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uMorphFactor;
  uniform vec2 uMouse;
  uniform float uIntensity;

  // Simplex 3D noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 1.0/7.0;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  // Morph between shapes
  vec3 morphShape(vec3 pos, float factor) {
    float r = length(pos);
    vec3 sphere = normalize(pos);

    // Torus
    float torusR = 0.65;
    float torusr = 0.25;
    float torusDist = length(vec2(length(pos.xz) - torusR, pos.y)) - torusr;
    vec3 torusNormal = normalize(vec3(
      pos.x * (1.0 - torusR / length(pos.xz)),
      pos.y,
      pos.z * (1.0 - torusR / length(pos.xz))
    ));

    // Cube
    vec3 cubeNormal = sign(pos) * max(abs(pos), 0.7);
    float cubeDist = length(max(abs(pos) - 0.7, 0.0));

    // Morph
    vec3 normal = mix(mix(sphere, torusNormal, factor), cubeNormal, factor * factor);
    float dist = mix(mix(r, torusDist, factor), cubeDist, factor * factor);

    return normal * (1.0 + dist * 0.3);
  }

  void main() {
    vNormal = normalMatrix * normal;
    vPosition = position;
    vUv = uv;

    float morph = uMorphFactor;

    // Base shape morphing
    vec3 morphed = morphShape(position, morph);

    // Noise displacement
    float noise1 = snoise(morphed * 1.5 + uTime * 0.15);
    float noise2 = snoise(morphed * 3.0 - uTime * 0.1) * 0.5;
    float noise3 = snoise(morphed * 6.0 + uTime * 0.05) * 0.25;
    float displacement = (noise1 + noise2 + noise3) * uIntensity * 0.15;

    // Mouse interaction
    vec3 mouseDir = normalize(vec3(uMouse.x - 0.5, uMouse.y - 0.5, 0.0));
    float mouseDist = length(morphed.xy - uMouse.xy + 0.5);
    float mouseInfluence = smoothstep(0.8, 0.0, mouseDist) * 0.3;
    morphed += mouseDir * mouseInfluence;

    vec3 finalPos = morphed + normal * displacement;

    vPosition = finalPos;
    vNormal = normalMatrix * normalize(morphed);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPos, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform float uFresnelPower;
  uniform float uOpacity;

  void main() {
    vec3 viewDir = normalize(-vPosition);
    float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), uFresnelPower);

    // Multi-layer coloring
    float h = vPosition.y * 0.5 + 0.5;
    float r = length(vPosition.xz);

    vec3 color = mix(uColorA, uColorB, h);
    color = mix(color, uColorC, smoothstep(0.3, 0.7, r));

    // Iridescent shift
    float iridescence = sin(vPosition.x * 10.0 + uTime * 0.5) * 0.5 + 0.5;
    iridescence *= sin(vPosition.z * 8.0 - uTime * 0.3) * 0.5 + 0.5;
    color += vec3(iridescence * 0.15, iridescence * 0.1, iridescence * 0.2) * fresnel;

    // Rim lighting
    float rim = pow(fresnel, 2.0) * 0.8;
    color += vec3(rim * 0.4, rim * 0.2, rim * 0.6);

    // Subsurface scattering fake
    float sss = pow(1.0 - dot(vNormal, viewDir), 4.0) * 0.3;
    color += vec3(sss * 0.2, sss * 0.1, sss * 0.4);

    float alpha = uOpacity * (0.6 + fresnel * 0.4);

    gl_FragColor = vec4(color, alpha);
  }
`;

export default function ThreeDBackground() {
  const canvasRef = useRef(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        setWidth(canvasRef.current.clientWidth);
        setHeight(canvasRef.current.clientHeight);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMouse({
        x: e.clientX / window.innerWidth,
        y: 1.0 - e.clientY / window.innerHeight,
      });
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const scene = useMemo(() => new THREE.Scene(), []);
  const camera = useMemo(() => new THREE.PerspectiveCamera(50, width / height || 1, 0.1, 100), [width, height]);
  const renderer = useMemo(() => {
    const r = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
      premultipliedAlpha: true,
      powerPreference: "high-performance",
    });
    r.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    r.setSize(width, height);
    r.setClearColor(0x000000, 0);
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.toneMappingExposure = 1.0;
    return r;
  }, [width, height]);

  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1.5, 64);
    return geo;
  }, []);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms: {
        uTime: { value: 0 },
        uMorphFactor: { value: 0 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uIntensity: { value: 1.0 },
        uColorA: { value: new THREE.Color(0x00ffff) },
        uColorB: { value: new THREE.Color(0xbf00ff) },
        uColorC: { value: new THREE.Color(0xffaa00) },
        uFresnelPower: { value: 3.0 },
        uOpacity: { value: 0.65 },
      },
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  const mesh = useMemo(() => new THREE.Mesh(geometry, material), [geometry, material]);

  const wireGeometry = useMemo(() => new THREE.IcosahedronGeometry(1.52, 16), []);
  const wireMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    transparent: true,
    opacity: 0.05,
    wireframe: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }), []);
  const wireMesh = useMemo(() => new THREE.Mesh(wireGeometry, wireMaterial), [wireGeometry, wireMaterial]);

  useEffect(() => {
    scene.add(mesh);
    scene.add(wireMesh);
    camera.position.z = 4;
    return () => {
      scene.remove(mesh);
      scene.remove(wireMesh);
      geometry.dispose();
      material.dispose();
      wireGeometry.dispose();
      wireMaterial.dispose();
    };
  }, [scene, mesh, wireMesh, camera, geometry, material, wireGeometry, wireMaterial]);

  useEffect(() => {
    if (prefersReducedMotion) return;

    let startTime = performance.now();
    let morphTarget = 0;
    let currentMorph = 0;

    const animate = (time) => {
      const elapsed = (time - startTime) * 0.001;

      // Smooth morph cycling
      const targetMorph = (Math.sin(elapsed * 0.15) + 1) * 0.5;
      currentMorph += (targetMorph - currentMorph) * 0.02;

      material.uniforms.uTime.value = elapsed;
      material.uniforms.uMorphFactor.value = currentMorph;
      material.uniforms.uMouse.value.set(mouse.x, mouse.y);

      // Subtle rotation
      mesh.rotation.y = elapsed * 0.03;
      mesh.rotation.x = Math.sin(elapsed * 0.1) * 0.15;
      wireMesh.rotation.y = elapsed * 0.025;
      wireMesh.rotation.x = Math.sin(elapsed * 0.1) * 0.12;

      // Pulse intensity
      material.uniforms.uIntensity.value = 0.8 + Math.sin(elapsed * 0.5) * 0.2;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [prefersReducedMotion, mouse, material, mesh, wireMesh, renderer, scene, camera]);

  if (prefersReducedMotion) {
    return (
      <div
        ref={canvasRef}
        className="three-d-bg-fallback"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -2,
          background: "radial-gradient(ellipse at 20% 20%, oklch(0.4 0.15 185 / 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, oklch(0.35 0.12 280 / 0.1) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, oklch(0.3 0.1 45 / 0.08) 0%, transparent 50%)",
        }}
        aria-hidden="true"
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="three-d-bg-canvas"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: -2,
        display: "block",
        pointerEvents: "none",
      }}
      aria-hidden="true"
      aria-label="Interactive 3D morphing geometry background"
    />
  );
}