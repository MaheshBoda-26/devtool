import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, Html, shaderMaterial } from "@react-three/drei";
import { useRef, useState, useEffect, useMemo } from "react";
import * as THREE from "three";
import { BufferGeometry, ShaderMaterial, Points as ThreePoints, AdditiveBlending } from "three";
import styles from "./TechBackground.module.css";

const PARTICLE_COUNT = 1500;
const GRID_SIZE = 100;
const GRID_DIVISIONS = 50;

const ParticleShader = shaderMaterial(
  {
    uTime: 0,
    uMouse: new THREE.Vector2(0, 0),
    uResolution: new THREE.Vector2(1, 1),
    uColorA: new THREE.Color(0x00d4ff),
    uColorB: new THREE.Color(0xb84cff),
    uColorC: new THREE.Color(0xffd700),
    uScroll: 0,
  },
  `
    attribute float aSize;
    attribute vec3 aColor;
    attribute float aPhase;
    attribute float aSpeed;
    varying vec3 vColor;
    varying float vAlpha;
    uniform float uTime;
    uniform vec2 uMouse;
    uniform vec2 uResolution;
    uniform float uScroll;
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    uniform vec3 uColorC;

    float noise(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    float fbm(vec2 p) {
      float value = 0.0;
      float amplitude = 0.5;
      for (int i = 0; i < 4; i++) {
        value += amplitude * noise(p);
        p *= 2.0;
        amplitude *= 0.5;
      }
      return value;
    }

    void main() {
      vec3 pos = position;

      float time = uTime * 0.001;
      float phase = aPhase + time * aSpeed;

      float n = fbm(pos.xz * 0.01 + time * 0.1);
      pos.y += n * 20.0 * aSpeed;
      pos.x += sin(phase) * 15.0 * aSpeed;
      pos.z += cos(phase * 1.3) * 15.0 * aSpeed;

      vec2 mousePos = (uMouse / uResolution - 0.5) * 2.0;
      float distToMouse = length(pos.xz - mousePos * 50.0);
      float mouseInfluence = smoothstep(80.0, 0.0, distToMouse) * 0.5;
      pos.y += mouseInfluence * 30.0;
      pos.x += mouseInfluence * (mousePos.x - pos.x) * 0.3;
      pos.z += mouseInfluence * (mousePos.y - pos.z) * 0.3;

      pos.y += uScroll * 0.05;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = aSize * (300.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;

      float colorPhase = phase * 0.5;
      vColor = mix(uColorA, uColorB, sin(colorPhase) * 0.5 + 0.5);
      vColor = mix(vColor, uColorC, sin(colorPhase * 1.7) * 0.5 + 0.5);
      vAlpha = 0.3 + 0.7 * (1.0 - smoothstep(0.0, 100.0, distToMouse));
    }
  `,
  `
    varying vec3 vColor;
    varying float vAlpha;
    uniform float uTime;

    void main() {
      float dist = length(gl_PointCoord - 0.5);
      float alpha = smoothstep(0.5, 0.0, dist) * vAlpha;
      float pulse = 0.7 + 0.3 * sin(uTime * 0.003 + vColor.r * 10.0);
      gl_FragColor = vec4(vColor * pulse, alpha);
      if (alpha < 0.01) discard;
    }
  `
);

function ParticleSystem({ mouse, scrollY }) {
  const geometryRef = useRef(null);
  const materialRef = useRef(null);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const geometry = new BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const phases = new Float32Array(PARTICLE_COUNT);
    const speeds = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const radius = 40 + Math.random() * 80;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

      sizes[i] = 1 + Math.random() * 3;
      colors[i * 3] = Math.random();
      colors[i * 3 + 1] = Math.random();
      colors[i * 3 + 2] = Math.random();
      phases[i] = Math.random() * Math.PI * 2;
      speeds[i] = 0.3 + Math.random() * 0.7;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    geometry.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));
    geometryRef.current = geometry;
  }, []);

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime() * 1000;
      materialRef.current.uniforms.uMouse.value.set(mouse.x, mouse.y);
      materialRef.current.uniforms.uResolution.value.set(state.size.width, state.size.height);
      materialRef.current.uniforms.uScroll.value = scrollY;
    }
  });

  const material = useMemo(() => {
    const mat = ParticleShader({
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      vertexColors: true,
    });
    materialRef.current = mat;
    return mat;
  }, []);

  return (
    <Points geometry={geometryRef.current} material={material} />
  );
}

function GridLines({ scrollY }) {
  const gridRef = useRef();
  const materialRef = useRef();

  useFrame((state) => {
    if (gridRef.current && materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime() * 1000;
      materialRef.current.uniforms.uScroll.value = scrollY;

      gridRef.current.position.y = -(scrollY * 0.02) % 4;
    }
  });

  const gridMaterial = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uScroll: { value: 0 },
        uColor: { value: new THREE.Color(0x00d4ff) },
        uColorB: { value: new THREE.Color(0xb84cff) },
      },
      vertexShader: `
        varying vec2 vUv;
        uniform float uTime;
        uniform float uScroll;
        void main() {
          vUv = uv;
          vec3 pos = position;
          pos.y += uScroll * 0.01;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform float uTime;
        uniform vec3 uColor;
        uniform vec3 uColorB;
        float grid = step(0.98, max(mod(vUv.x * 50.0, 1.0), mod(vUv.y * 50.0, 1.0)));
        float pulse = 0.3 + 0.7 * sin(uTime * 0.001 + vUv.y * 10.0);
        vec3 color = mix(uColor, uColorB, vUv.y);
        gl_FragColor = vec4(color, (1.0 - grid) * pulse * 0.15);
      `,
    });
    materialRef.current = mat;
    return mat;
  }, []);

  return (
    <mesh ref={gridRef} rotation={[-Math.PI / 2, 0, 0]} scale={200} material={gridMaterial}>
      <planeGeometry args={[GRID_SIZE, GRID_SIZE, GRID_DIVISIONS, GRID_DIVISIONS]} />
    </mesh>
  );
}

function FlowLines({ scrollY }) {
  const linesRef = useRef();
  const materialRef = useRef();

  useFrame((state) => {
    if (linesRef.current && materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime() * 1000;
      materialRef.current.uniforms.uScroll.value = scrollY;
    }
  });

  const lineMaterial = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uScroll: { value: 0 },
        uColor: { value: new THREE.Color(0x00d4ff) },
      },
      vertexShader: `
        attribute float aOffset;
        attribute float aSpeed;
        varying float vAlpha;
        uniform float uTime;
        uniform float uScroll;
        void main() {
          vec3 pos = position;
          float t = uTime * 0.001 * aSpeed + aOffset;
          pos.x += sin(t + pos.z * 0.1) * 3.0;
          pos.z += cos(t * 1.2 + pos.x * 0.1) * 3.0;
          pos.y += uScroll * 0.02;
          vAlpha = 0.5 + 0.5 * sin(t);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        uniform vec3 uColor;
        uniform float uTime;
        void main() {
          float pulse = 0.5 + 0.5 * sin(uTime * 0.002);
          gl_FragColor = vec4(uColor, vAlpha * pulse * 0.3);
        }
      `,
    });
    materialRef.current = mat;
    return mat;
  }, []);

  const geometry = useMemo(() => {
    const geo = new BufferGeometry();
    const count = 200;
    const positions = new Float32Array(count * 3);
    const offsets = new Float32Array(count);
    const speeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 120;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 120;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 120;
      offsets[i] = Math.random() * Math.PI * 2;
      speeds[i] = 0.5 + Math.random() * 1.5;
    }

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aOffset", new THREE.BufferAttribute(offsets, 1));
    geo.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));
    return geo;
  }, []);

  return <points ref={linesRef} geometry={geometry} material={lineMaterial} />;
}

function CornerBrackets() {
  return (
    <>
      {[-1, 1].map((x) =>
        [-1, 1].map((z) => (
          <group key={`${x}-${z}`} position={[x * 55, 0, z * 55]} rotation={[0, (x === z ? -1 : 1) * Math.PI / 2, 0]}>
            <mesh
              geometry={new THREE.BoxGeometry(20, 2, 2)}
              material={new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.6 })}
              position={[0, -1, 0]}
            />
            <mesh
              geometry={new THREE.BoxGeometry(2, 2, 20)}
              material={new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.6 })}
              position={[0, -1, 0]}
            />
            <mesh
              geometry={new THREE.BoxGeometry(20, 2, 2)}
              material={new THREE.MeshBasicMaterial({ color: 0xb84cff, transparent: true, opacity: 0.4 })}
              position={[0, 1, 0]}
            />
            <mesh
              geometry={new THREE.BoxGeometry(2, 2, 20)}
              material={new THREE.MeshBasicMaterial({ color: 0xb84cff, transparent: true, opacity: 0.4 })}
              position={[0, 1, 0]}
            />
          </group>
        ))
      ).flat()}
    </>
  );
}

function DataNodes() {
  const nodesRef = useRef([]);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const createNodes = () => {
      const nodes = [];
      for (let i = 0; i < 30; i++) {
        const radius = 20 + Math.random() * 60;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        nodes.push({
          position: new THREE.Vector3(
            radius * Math.sin(phi) * Math.cos(theta),
            (Math.random() - 0.5) * 40,
            radius * Math.sin(phi) * Math.sin(theta)
          ),
          baseRadius: radius,
          theta,
          phi,
          speed: 0.0001 + Math.random() * 0.0003,
          phase: Math.random() * Math.PI * 2,
          size: 0.5 + Math.random() * 1.5,
          color: Math.random() > 0.5 ? new THREE.Color(0x00d4ff) : new THREE.Color(0xb84cff),
        });
      }
      nodesRef.current = nodes;
    };
    createNodes();
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime() * 1000;
    nodesRef.current.forEach((node) => {
      node.theta += node.speed * 100;
      node.phi += node.speed * 50;
      node.position.x = node.baseRadius * Math.sin(node.phi) * Math.cos(node.theta);
      node.position.z = node.baseRadius * Math.sin(node.phi) * Math.sin(node.theta);
      node.position.y += Math.sin(time * 0.001 + node.phase) * 0.02;
    });
    forceUpdate((n) => n + 1);
  });

  return (
    <group>
      {nodesRef.current.map((node, i) => (
        <mesh
          key={i}
          position={node.position}
          scale={node.size}
          onPointerOver={(e) => { e.object.material.opacity = 1; e.object.material.emissiveIntensity = 1; }}
          onPointerOut={(e) => { e.object.material.opacity = 0.6; e.object.material.emissiveIntensity = 0; }}
        >
          <icosahedronGeometry args={[1, 0]} />
          <meshPhysicalMaterial
            color={node.color}
            transparent
            opacity={0.6}
            transmission={0.3}
            roughness={0.2}
            metalness={0.8}
            clearcoat={1}
            clearcoatRoughness={0.1}
            emissive={node.color}
            emissiveIntensity={0}
          />
        </mesh>
      ))}
    </group>
  );
}

function MouseTracker() {
  const { camera, size } = useThree();
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      setMouse({
        x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
        y: -((e.clientY - rect.top) / rect.height) * 2 + 1,
      });
    };
    const canvas = document.querySelector("canvas");
    canvas?.addEventListener("mousemove", handleMove);
    return () => canvas?.removeEventListener("mousemove", handleMove);
  }, []);

  return null;
}

export default function TechBackground() {
  const [scrollY, setScrollY] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <div className={styles.fallback} aria-hidden="true" />
    );
  }

  return (
    <div className={styles.container} role="img" aria-label="Animated cyberpunk grid with flowing particles and data nodes">
      <Canvas
        className={styles.canvas}
        camera={{ position: [0, 0, 80], fov: 50 }}
        style={{ touchAction: "none" }}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
        shadows={false}
      >
        <color attach="background" args={["#06080a"]} />
        <fog attach="fog" args={["#06080a", 30, 150]} />

        <ambientLight intensity={0.3} />
        <directionalLight position={[50, 100, 50]} intensity={0.5} color="#00d4ff" />
        <directionalLight position={[-50, 50, -50]} intensity={0.3} color="#b84cff" />
        <pointLight position={[0, 20, 30]} intensity={0.5} color="#00d4ff" distance={100} decay={2} />

        <GridLines scrollY={scrollY} />
        <FlowLines scrollY={scrollY} />
        <ParticleSystem mouse={{ x: 0, y: 0 }} scrollY={scrollY} />
        <DataNodes />
        <CornerBrackets />

        <MouseTracker />
      </Canvas>
      <div className={styles.overlay} aria-hidden="true" />
    </div>
  );
}