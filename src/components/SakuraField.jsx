import React, { useRef, useEffect } from 'react';

const SakuraField = () => {
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

    // Color palette: Elegant white, silver, and crystal pearl Japanese blossoms (pure & clean)
    const petalColors = [
      'rgba(255, 255, 255, 0.90)', // pure white petal
      'rgba(245, 248, 255, 0.85)', // frosty silver white
      'rgba(235, 242, 250, 0.80)', // soft pearl
      'rgba(255, 252, 245, 0.88)', // warm ivory petal
      'rgba(220, 230, 245, 0.75)', // translucent crystal
      'rgba(255, 255, 255, 0.95)', // bright snow white
    ];

    class SakuraPetal {
      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        this.x = Math.random() * width;
        this.y = initial ? Math.random() * height : -30 - Math.random() * 40;
        this.size = Math.random() * 8 + 7; // 7 to 15px
        this.color = petalColors[Math.floor(Math.random() * petalColors.length)];
        
        // Falling & swaying physics
        this.speedY = Math.random() * 1.2 + 0.8; // gentle fall
        this.speedX = Math.random() * 0.8 - 0.4;
        this.sway = Math.random() * 0.02 + 0.01;
        this.swayAngle = Math.random() * Math.PI * 2;
        
        // 3D Rotation & flip simulation
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 1.5;
        this.flip = Math.random() * Math.PI;
        this.flipSpeed = Math.random() * 0.03 + 0.01;

        // Is this a full 5-petal blossom or a single delicate petal?
        // 20% chance of falling full 5-petal flower
        this.isFullFlower = Math.random() < 0.2;
        if (this.isFullFlower) {
          this.size = Math.random() * 7 + 10; // slightly larger for full blossom
        }
      }

      update() {
        this.swayAngle += this.sway;
        this.x += Math.sin(this.swayAngle) * 0.9 + 0.3; // gentle rightward wind breeze
        this.y += this.speedY;

        this.rotation += this.rotationSpeed;
        this.flip += this.flipSpeed;

        // Wrap around bottom
        if (this.y > height + 40 || this.x > width + 40 || this.x < -40) {
          this.reset(false);
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        // Simulate 3D tumbling by scaling along one axis
        ctx.scale(Math.cos(this.flip), 1);

        if (this.isFullFlower) {
          // Draw a delicate 5-petal Japanese cherry flower
          const petals = 5;
          const petalRadius = this.size * 0.6;
          for (let i = 0; i < petals; i++) {
            ctx.save();
            ctx.rotate((i * 2 * Math.PI) / petals);
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(
              petalRadius * 0.5,
              -petalRadius * 0.8,
              petalRadius * 0.8,
              -petalRadius * 1.4,
              0,
              -petalRadius * 1.6
            );
            ctx.bezierCurveTo(
              -petalRadius * 0.8,
              -petalRadius * 1.4,
              -petalRadius * 0.5,
              -petalRadius * 0.8,
              0,
              0
            );
            ctx.fill();
            ctx.restore();
          }

          // Golden/amber flower center
          ctx.beginPath();
          ctx.arc(0, 0, this.size * 0.15, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 215, 0, 0.85)';
          ctx.fill();
        } else {
          // Draw a single natural notched sakura petal
          ctx.fillStyle = this.color;
          ctx.beginPath();
          const s = this.size;
          ctx.moveTo(0, -s);
          ctx.bezierCurveTo(s * 0.6, -s * 0.8, s * 0.7, -s * 0.1, s * 0.4, s * 0.6);
          ctx.bezierCurveTo(s * 0.2, s * 0.9, 0, s, 0, s * 1.05);
          ctx.bezierCurveTo(0, s, -s * 0.2, s * 0.9, -s * 0.4, s * 0.6);
          ctx.bezierCurveTo(-s * 0.7, -s * 0.1, -s * 0.6, -s * 0.8, 0, -s);
          ctx.fill();
        }

        ctx.restore();
      }
    }

    // Number of falling petals/flowers
    const petalCount = Math.min(50, Math.floor(window.innerWidth / 28));
    const petals = Array.from({ length: petalCount }, () => new SakuraPetal());

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < petals.length; i++) {
        petals[i].update();
        petals[i].draw();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10 w-full h-full"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

export default SakuraField;
