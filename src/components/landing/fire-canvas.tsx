"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  size: number;
  life: number;
  maxLife: number;
  drift: number;
  velocity: number;
  color: string;
};

const COLORS = ["#FF6B35", "#FF8C00", "#FFD700"];

export function FireCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrame = 0;
    let particles: Particle[] = [];
    const sources = [
      { x: 0.18, y: 0.84 },
      { x: 0.48, y: 0.82 },
      { x: 0.82, y: 0.8 },
    ];

    const resize = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    };

    const spawnParticle = () => {
      const source = sources[Math.floor(Math.random() * sources.length)];
      const width = window.innerWidth;
      const height = window.innerHeight;
      particles.push({
        x: source.x * width + (Math.random() - 0.5) * 24,
        y: source.y * height + (Math.random() - 0.5) * 14,
        size: Math.random() * 6 + 4,
        life: 0,
        maxLife: Math.random() * 36 + 32,
        drift: (Math.random() - 0.5) * 0.9,
        velocity: Math.random() * 1.8 + 1.2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      if (particles.length < 110) {
        for (let i = 0; i < 4; i += 1) spawnParticle();
      }

      particles = particles.filter((particle) => particle.life < particle.maxLife);
      particles.forEach((particle) => {
        particle.life += 1;
        particle.y -= particle.velocity;
        particle.x += Math.sin(particle.life / 8) * 0.6 + particle.drift;
        const progress = particle.life / particle.maxLife;
        const alpha = progress < 0.3 ? progress / 0.3 : 1 - progress;

        ctx.beginPath();
        ctx.fillStyle = `${particle.color}${Math.round(alpha * 255)
          .toString(16)
          .padStart(2, "0")}`;
        ctx.shadowBlur = 18;
        ctx.shadowColor = particle.color;
        ctx.arc(particle.x, particle.y, particle.size * (1 - progress * 0.4), 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrame = window.requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-10" aria-hidden="true" />;
}
