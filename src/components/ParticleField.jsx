import React, { useRef, useEffect } from 'react';

const ParticleField = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    let particles = [];
    // Monochrome Silver & Pure White sparks
    const colors = [
      'rgba(255, 255, 255, 0.85)',
      'rgba(230, 230, 240, 0.75)',
      'rgba(200, 200, 210, 0.65)',
      'rgba(255, 255, 255, 0.95)',
      'rgba(160, 160, 175, 0.55)'
    ];
    
    let mouse = { x: -1000, y: -1000 };
    let scrollY = window.scrollY;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    
    window.addEventListener('resize', resize);
    resize();
    
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleScroll = () => {
      scrollY = window.scrollY;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    class Particle {
      constructor() {
        this.reset(true);
      }
      
      reset(initial = false) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.x = Math.random() * width;
        this.y = initial ? Math.random() * height : -20 - Math.random() * 50;
        this.size = Math.random() * 3.5 + 2.5;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.isEmber = Math.random() > 0.4;
        
        // Speed
        this.speedY = this.isEmber ? -(Math.random() * 1.2 + 0.3) : Math.random() * 1.4 + 0.4;
        this.speedX = (Math.random() - 0.5) * 1.2;
        
        if (this.isEmber && initial) {
          this.y = Math.random() * height;
        }

        // Swaying & rotation
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = Math.random() * 0.03 + 0.01;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.04;
        this.angle3d = Math.random() * Math.PI * 2;
        this.angle3dSpeed = Math.random() * 0.05 + 0.02;
      }
      
      update() {
        const height = window.innerHeight;
        const width = window.innerWidth;

        this.y += this.speedY;
        this.wobble += this.wobbleSpeed;
        this.x += Math.sin(this.wobble) * 0.8 + this.speedX;
        this.rotation += this.rotationSpeed;
        this.angle3d += this.angle3dSpeed;
        
        // Mouse push effect (wind gust)
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 160) {
          const force = (160 - dist) / 160;
          this.x += (dx / dist) * force * 5;
          this.y += (dy / dist) * force * 3;
        }
        
        // Reset out of bounds
        if (this.isEmber) {
          if (this.y < -30 || this.x < -30 || this.x > width + 30) this.reset();
        } else {
          if (this.y > height + 30 || this.x < -30 || this.x > width + 30) this.reset();
        }
      }
      
      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        if (this.isEmber) {
          // Glow spark dot
          ctx.beginPath();
          ctx.arc(0, 0, this.size * 0.6, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.shadowBlur = 10;
          ctx.shadowColor = this.color;
          ctx.fill();
        } else {
          // Petal shape
          const flip = Math.sin(this.angle3d);
          ctx.scale(flip, 1);
          ctx.rotate(this.rotation);
          
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(this.size, -this.size, this.size * 2, 0);
          ctx.quadraticCurveTo(this.size, this.size, 0, 0);
          
          ctx.fillStyle = this.color;
          ctx.fill();
          ctx.closePath();
        }
        
        ctx.restore();
      }
    }
    
    for (let i = 0; i < 75; i++) {
      particles.push(new Particle());
    }
    
    const render = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      ctx.clearRect(0, 0, width, height);
      
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      
      animationFrameId = requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1]"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
};

export default ParticleField;
