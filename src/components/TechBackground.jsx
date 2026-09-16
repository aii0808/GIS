import React, { useEffect, useRef } from 'react';

/**
 * Background Beranimasi Tech Interaktif (HTML5 Canvas 60fps)
 * Menggambar partikel digital melayang yang saling terhubung dengan garis laser sirkuit,
 * serta merespons interaksi gerakan kursor mouse secara dinamis.
 */
export default function TechBackground({ isDarkMode = true, accent = 'emerald' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Kursor Mouse Tracker
    const mouse = {
      x: null,
      y: null,
      radius: 140,
    };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Konfigurasi Partikel Berdasarkan Ukuran Layar
    const particleCount = width < 768 ? 28 : 55;
    const particles = [];

    // Warna berdasarkan tema & aksen
    const getAccentColors = () => {
      if (accent === 'siber' || accent === 'amber') {
        return {
          primary: isDarkMode ? '245, 158, 11' : '217, 119, 6',
          secondary: isDarkMode ? '251, 191, 36' : '180, 83, 9',
        };
      }
      if (accent === 'modern-3d' || accent === 'violet') {
        return {
          primary: isDarkMode ? '139, 92, 246' : '124, 58, 237',
          secondary: isDarkMode ? '167, 139, 250' : '109, 40, 217',
        };
      }
      // Default: Emerald Cyber (tech)
      return {
        primary: isDarkMode ? '16, 185, 129' : '5, 150, 105',
        secondary: isDarkMode ? '52, 211, 153' : '4, 120, 87',
      };
    };

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.7;
        this.vy = (Math.random() - 0.5) * 0.7;
        this.radius = Math.random() * 2 + 1.2;
        this.pulse = Math.random() * Math.PI;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.pulse += 0.03;

        // Pantulan di dinding layar
        if (this.x < 0 || this.x > width) this.vx = -this.vx;
        if (this.y < 0 || this.y > height) this.vy = -this.vy;

        // Interaksi kursor mouse
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            this.x -= (dx / dist) * force * 2.5;
            this.y -= (dy / dist) * force * 2.5;
          }
        }
      }

      draw(colors) {
        const pulseSize = this.radius + Math.sin(this.pulse) * 0.4;
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.max(0.5, pulseSize), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${colors.primary}, ${isDarkMode ? 0.7 : 0.5})`;
        ctx.fill();

        // Glow ring halus
        ctx.beginPath();
        ctx.arc(this.x, this.y, pulseSize * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${colors.secondary}, ${isDarkMode ? 0.12 : 0.08})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Gambar Garis Sambungan Sirkuit Laser
    const connectParticles = (colors) => {
      const maxDist = 115;
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const opacity = (1 - dist / maxDist) * (isDarkMode ? 0.22 : 0.15);
            ctx.strokeStyle = `rgba(${colors.primary}, ${opacity})`;
            ctx.lineWidth = 0.9;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }

        // Sambungan ke mouse jika dekat
        if (mouse.x !== null && mouse.y !== null) {
          const dx = particles[a].x - mouse.x;
          const dy = particles[a].y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const opacity = (1 - dist / mouse.radius) * (isDarkMode ? 0.45 : 0.3);
            ctx.strokeStyle = `rgba(${colors.secondary}, ${opacity})`;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }
    };

    // Tactical Coordinate Crosshairs (+)
    const drawGridCrosses = (colors) => {
      const spacing = 160;
      ctx.strokeStyle = `rgba(${colors.primary}, ${isDarkMode ? 0.04 : 0.03})`;
      ctx.lineWidth = 1;
      const size = 4;

      for (let x = spacing; x < width; x += spacing) {
        for (let y = spacing; y < height; y += spacing) {
          ctx.beginPath();
          ctx.moveTo(x - size, y);
          ctx.lineTo(x + size, y);
          ctx.moveTo(x, y - size);
          ctx.lineTo(x, y + size);
          ctx.stroke();
        }
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const colors = getAccentColors();

      drawGridCrosses(colors);

      particles.forEach((p) => {
        p.update();
        p.draw(colors);
      });

      connectParticles(colors);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDarkMode, accent]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-500"
      style={{ opacity: isDarkMode ? 0.85 : 0.55 }}
    />
  );
}
