import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  type: 'sakura' | 'heart' | 'cat';
  x: number;
  y: number;
  delay: number;
  duration: number;
}

export default function AnimatedBackground() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 60; i++) {
      newParticles.push({
        id: i,
        type: Math.random() < 0.34 ? 'sakura' : Math.random() < 0.67 ? 'heart' : 'cat',
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 10,
        // Was ~15-25s. Now ~10-16s (~50% faster).
        duration: 10 + Math.random() * 6,
      });
    }
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-gradient-to-br from-rose-100/30 via-pink-100/30 to-pink-200/30 backdrop-blur-3xl" />
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
          {particle.type === 'sakura' ? '🌸' : particle.type === 'heart' ? '💕' : '😺'}
        </div>
      ))}
    </div>
  );
}
