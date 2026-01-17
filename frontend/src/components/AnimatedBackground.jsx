import { useEffect, useRef } from 'react';
import './AnimatedBackground.css';

function AnimatedBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 30;

    class Particle {
      constructor() {
        this.reset();
        this.y = Math.random() * canvas.height;
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = -20;
        this.speed = 0.5 + Math.random() * 1;
        this.size = 10 + Math.random() * 15;
        this.swing = Math.random() * 2 - 1;
        this.swingSpeed = 0.01 + Math.random() * 0.02;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.05;
        this.type = Math.random() > 0.5 ? 'petal' : 'heart';
        this.opacity = 0.4 + Math.random() * 0.4;
      }

      update() {
        this.y += this.speed;
        this.x += Math.sin(this.y * this.swingSpeed) * this.swing;
        this.rotation += this.rotationSpeed;

        if (this.y > canvas.height + 20) {
          this.reset();
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.opacity;

        if (this.type === 'heart') {
          ctx.fillStyle = '#ff69b4';
          ctx.beginPath();
          const topCurveHeight = this.size * 0.3;
          ctx.moveTo(0, topCurveHeight);
          ctx.bezierCurveTo(
            0, 0,
            -this.size / 2, 0,
            -this.size / 2, topCurveHeight
          );
          ctx.bezierCurveTo(
            -this.size / 2, (topCurveHeight + this.size) / 2,
            0, (topCurveHeight + this.size) / 1.5,
            0, this.size
          );
          ctx.bezierCurveTo(
            0, (topCurveHeight + this.size) / 1.5,
            this.size / 2, (topCurveHeight + this.size) / 2,
            this.size / 2, topCurveHeight
          );
          ctx.bezierCurveTo(
            this.size / 2, 0,
            0, 0,
            0, topCurveHeight
          );
          ctx.fill();
        } else {
          ctx.fillStyle = '#ffb6c1';
          ctx.beginPath();
          ctx.ellipse(0, 0, this.size, this.size * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="animated-background" />;
}

export default AnimatedBackground;
