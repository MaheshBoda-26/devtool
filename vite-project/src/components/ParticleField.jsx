import { useEffect, useRef, useState } from "react";
import styles from "./ParticleField.module.css";

const PARTICLE_COUNT = 60;

export default function ParticleField() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const orbsRef = useRef([]);
  const dimensionsRef = useRef({ width: 0, height: 0 });
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      canvas.getContext("2d").scale(dpr, dpr);
      dimensionsRef.current = { width: canvas.offsetWidth, height: canvas.offsetHeight };
      initParticles();
      initOrbs();
    };

    const ctx = canvas.getContext("2d");

    function initParticles() {
      const { width, height } = dimensionsRef.current;
      if (!width || !height) return;

      particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        radius: Math.random() * 1.2 + 0.4,
        baseRadius: Math.random() * 1.2 + 0.4,
        opacity: Math.random() * 0.3 + 0.05,
        hue: Math.random() > 0.7 ? 168 : (Math.random() > 0.5 ? 38 : 280),
        phase: Math.random() * Math.PI * 2,
      }));
    }

    function initOrbs() {
      const { width, height } = dimensionsRef.current;
      if (!width || !height) return;

      orbsRef.current = [
        {
          x: width * 0.15,
          y: height * 0.2,
          radius: Math.min(width, height) * 0.35,
          baseRadius: Math.min(width, height) * 0.35,
          hue: 168,
          saturation: 0.08,
          lightness: 0.12,
          speed: 0.0003,
          phaseX: 0,
          phaseY: Math.PI * 0.5,
        },
        {
          x: width * 0.85,
          y: height * 0.75,
          radius: Math.min(width, height) * 0.4,
          baseRadius: Math.min(width, height) * 0.4,
          hue: 38,
          saturation: 0.08,
          lightness: 0.1,
          speed: 0.00025,
          phaseX: Math.PI,
          phaseY: Math.PI * 1.5,
        },
        {
          x: width * 0.5,
          y: height * 0.5,
          radius: Math.min(width, height) * 0.25,
          baseRadius: Math.min(width, height) * 0.25,
          hue: 280,
          saturation: 0.06,
          lightness: 0.08,
          speed: 0.0002,
          phaseX: Math.PI * 0.5,
          phaseY: 0,
        },
      ];
    }

    function animate() {
      if (prefersReducedMotion) {
        drawStatic();
        return;
      }

      const { width, height } = dimensionsRef.current;
      ctx.clearRect(0, 0, width, height);

      // Update and draw orbs first (background)
      orbsRef.current.forEach((orb) => {
        orb.phaseX += orb.speed;
        orb.phaseY += orb.speed * 0.7;

        const driftX = Math.sin(orb.phaseX) * width * 0.03;
        const driftY = Math.cos(orb.phaseY) * height * 0.02;

        // Subtle mouse attraction
        const dx = mouseRef.current.x - orb.x;
        const dy = mouseRef.current.y - orb.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 300 && dist > 0) {
          const force = (300 - dist) / 300 * 0.5;
          orb.x += dx / dist * force;
          orb.y += dy / dist * force;
        }

        orb.x += driftX * 0.01;
        orb.y += driftY * 0.01;

        // Clamp to canvas with padding
        orb.x = Math.max(orb.radius, Math.min(width - orb.radius, orb.x));
        orb.y = Math.max(orb.radius, Math.min(height - orb.radius, orb.y));

        // Pulsing radius
        orb.radius = orb.baseRadius * (1 + Math.sin(orb.phaseX * 2) * 0.03);

        drawOrb(ctx, orb, width, height);
      });

      // Update and draw particles
      particlesRef.current.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        // Subtle noise flow
        const noise = Math.sin(p.x * 0.003 + Date.now() * 0.0004) * 0.08;
        p.vx += noise * 0.01;
        p.vy += Math.cos(p.y * 0.002 + Date.now() * 0.0003) * 0.01;

        // Orb attraction
        orbsRef.current.forEach((orb) => {
          const dx = orb.x - p.x;
          const dy = orb.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < orb.radius * 1.5 && dist > 0) {
            const force = (1 - dist / (orb.radius * 1.5)) * 0.003;
            p.vx += dx / dist * force;
            p.vy += dy / dist * force;
          }
        });

        // Mouse repulsion
        const mdx = p.x - mouseRef.current.x;
        const mdy = p.y - mouseRef.current.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < 120 && mdist > 0) {
          const force = (120 - mdist) / 120 * 0.5;
          p.vx += mdx / mdist * force;
          p.vy += mdy / mdist * force;
        }

        p.vx = Math.max(-0.4, Math.min(0.4, p.vx));
        p.vy = Math.max(-0.4, Math.min(0.4, p.vy));

        // Wrap around edges
        if (p.x < 0) { p.x = width; p.y = Math.random() * height; }
        if (p.x > width) { p.x = 0; p.y = Math.random() * height; }
        if (p.y < 0) { p.y = height; p.x = Math.random() * width; }
        if (p.y > height) { p.y = 0; p.x = Math.random() * width; }

        // Pulsing radius
        p.radius = p.baseRadius * (1 + Math.sin(Date.now() * 0.002 + p.phase) * 0.15);

        drawParticle(ctx, p);

        // Draw connections
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const p2 = particlesRef.current[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 100) {
            const opacity = (1 - dist / 100) * 0.08;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `oklch(0.55 0.10 168 / ${opacity})`;
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    }

    function drawStatic() {
      const { width, height } = dimensionsRef.current;
      ctx.clearRect(0, 0, width, height);
      orbsRef.current.forEach((orb) => drawOrb(ctx, orb));
      particlesRef.current.forEach((p) => drawParticle(ctx, p));
    }

    function drawOrb(ctx, orb) {
      const gradient = ctx.createRadialGradient(
        orb.x, orb.y, 0,
        orb.x, orb.y, orb.radius
      );
      gradient.addColorStop(0, `oklch(${orb.lightness + 0.04} ${orb.saturation} ${orb.hue} / 0.15)`);
      gradient.addColorStop(0.5, `oklch(${orb.lightness} ${orb.saturation} ${orb.hue} / 0.06)`);
      gradient.addColorStop(1, `oklch(${orb.lightness - 0.02} ${orb.saturation} ${orb.hue} / 0)`);

      ctx.beginPath();
      ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    function drawParticle(ctx, p) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      const saturation = p.hue === 168 ? 0.10 : (p.hue === 38 ? 0.12 : 0.08);
      ctx.fillStyle = `oklch(0.62 ${saturation} ${p.hue} / ${p.opacity})`;
      ctx.fill();
    }

    function handleMouseMove(e) {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    }

    function handleMouseLeave() {
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    }

    function handleVisibilityChange() {
      setIsVisible(!document.hidden);
    }

    resize();
    window.addEventListener("resize", resize);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [prefersReducedMotion]);

  if (!isVisible) return null;

  return (
    <canvas
      ref={canvasRef}
      className={styles.canvas}
      aria-hidden="true"
      role="img"
      aria-label="Ambient animated background with gradient orbs and flowing particles"
    />
  );
}