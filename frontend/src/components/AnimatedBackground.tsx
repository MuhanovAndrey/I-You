import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  type: 'sakura' | 'heart';
  x: number;
  y: number;
  delay: number;
  duration: number;
}

export default function AnimatedBackground() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 15; i++) {
      newParticles.push({
        id: i,
        type: Math.random() > 0.5 ? 'sakura' : 'heart',
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 10,
        duration: 15 + Math.random() * 10,
      });
    }
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-gradient-to-br from-pink-100/30 via-purple-100/30 to-pink-200/30 backdrop-blur-3xl" />
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute text-4xl opacity-30 animate-float"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        >
          {particle.type === 'sakura' ? '🌸' : '💕'}
        </div>
      ))}
    </div>
  );
}
