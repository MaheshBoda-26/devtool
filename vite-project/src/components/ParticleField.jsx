import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import styles from "./ParticleField.module.css";

const PARTICLE_COUNT = 50;

export default function ParticleField() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const particlesRef = useRef([]);
  const orbsRef = useRef([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const { innerWidth: width, innerHeight: height } = window;

    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: Math.random() * 2 + 0.5,
      baseRadius: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.4 + 0.1,
      hue: Math.random() > 0.6 ? 185 : (Math.random() > 0.4 ? 280 : 45),
      phase: Math.random() * Math.PI * 2,
      delay: i * 50,
    }));

    orbsRef.current = [
      {
        x: width * 0.15,
        y: height * 0.2,
        radius: Math.min(width, height) * 0.35,
        baseRadius: Math.min(width, height) * 0.35,
        hue: 185,
        saturation: 0.15,
        lightness: 0.08,
        speed: 0.0004,
        phaseX: 0,
        phaseY: Math.PI * 0.5,
      },
      {
        x: width * 0.85,
        y: height * 0.75,
        radius: Math.min(width, height) * 0.4,
        baseRadius: Math.min(width, height) * 0.4,
        hue: 280,
        saturation: 0.12,
        lightness: 0.06,
        speed: 0.00035,
        phaseX: Math.PI,
        phaseY: Math.PI * 1.5,
      },
      {
        x: width * 0.5,
        y: height * 0.5,
        radius: Math.min(width, height) * 0.25,
        baseRadius: Math.min(width, height) * 0.25,
        hue: 45,
        saturation: 0.1,
        lightness: 0.05,
        speed: 0.0003,
        phaseX: Math.PI * 0.5,
        phaseY: 0,
      },
    ];
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) return;

    let animationId;
    let lastTime = 0;

    const animate = (time) => {
      const dt = Math.min(time - lastTime, 50);
      lastTime = time;

      const { innerWidth: width, innerHeight: height } = window;

      orbsRef.current.forEach((orb) => {
        orb.phaseX += orb.speed * dt;
        orb.phaseY += orb.speed * dt * 0.7;

        const driftX = Math.sin(orb.phaseX) * width * 0.02;
        const driftY = Math.cos(orb.phaseY) * height * 0.015;

        orb.x += driftX * 0.005 * dt;
        orb.y += driftY * 0.005 * dt;

        orb.x = Math.max(orb.radius, Math.min(width - orb.radius, orb.x));
        orb.y = Math.max(orb.radius, Math.min(height - orb.radius, orb.y));

        orb.radius = orb.baseRadius * (1 + Math.sin(orb.phaseX * 1.5) * 0.05);
      });

      particlesRef.current.forEach((p) => {
        p.x += p.vx * dt * 0.02;
        p.y += p.vy * dt * 0.02;

        const noise = Math.sin(p.x * 0.002 + time * 0.0005) * 0.06;
        p.vx += noise * 0.005 * dt;
        p.vy += Math.cos(p.y * 0.0015 + time * 0.0004) * 0.005 * dt;

        orbsRef.current.forEach((orb) => {
          const dx = orb.x - p.x;
          const dy = orb.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < orb.radius * 1.3 && dist > 0) {
            const force = (1 - dist / (orb.radius * 1.3)) * 0.004;
            p.vx += dx / dist * force * dt * 0.01;
            p.vy += dy / dist * force * dt * 0.01;
          }
        });

        p.vx = Math.max(-0.5, Math.min(0.5, p.vx));
        p.vy = Math.max(-0.5, Math.min(0.5, p.vy));

        if (p.x < 0) { p.x = width; p.y = Math.random() * height; }
        if (p.x > width) { p.x = 0; p.y = Math.random() * height; }
        if (p.y < 0) { p.y = height; p.x = Math.random() * width; }
        if (p.y > height) { p.y = 0; p.x = Math.random() * width; }

        p.radius = p.baseRadius * (1 + Math.sin(time * 0.002 + p.phase) * 0.2);
      });

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [prefersReducedMotion]);

  return (
    <>
      <div className={styles.canvas} aria-hidden="true" role="img" aria-label="Animated gradient orbs and flowing particles background">
        {orbsRef.current.map((orb, i) => (
          <motion.div
            key={`orb-${i}`}
            className={styles.orb}
            style={{
              left: orb.x,
              top: orb.y,
              width: orb.radius * 2,
              height: orb.radius * 2,
              background: `radial-gradient(ellipse at center, oklch(${orb.lightness + 0.08} ${orb.saturation} ${orb.hue} / 0.25) 0%, oklch(${orb.lightness} ${orb.saturation} ${orb.hue} / 0.1) 40%, transparent 70%)`,
            }}
            animate={{
              scale: [1, 1.08, 1],
              x: [0, Math.sin(orb.phaseX) * 30, 0],
              y: [0, Math.cos(orb.phaseY) * 20, 0],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
        {particlesRef.current.map((p, i) => (
          <motion.div
            key={`particle-${i}`}
            className={styles.particle}
            style={{
              left: p.x,
              top: p.y,
              width: p.radius * 2,
              height: p.radius * 2,
              background: `oklch(0.7 ${p.hue === 185 ? 0.15 : p.hue === 280 ? 0.12 : 0.1} ${p.hue} / ${p.opacity})`,
              opacity: p.opacity,
            }}
            animate={{
              x: [
                0,
                Math.sin(p.phase) * 40,
                Math.sin(p.phase + 2) * -30,
                0,
              ],
              y: [
                0,
                Math.cos(p.phase) * 25,
                Math.cos(p.phase + 1) * -35,
                0,
              ],
              scale: [1, 1.3, 0.7, 1],
              opacity: [p.opacity, p.opacity * 1.5, p.opacity * 0.5, p.opacity],
            }}
            transition={{
              duration: 12 + (i % 5) * 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: p.delay,
            }}
          />
        ))}
      </div>
      <div className={styles.noise} aria-hidden="true" />
      <div className={styles.grid} aria-hidden="true" />
    </>
  );
}