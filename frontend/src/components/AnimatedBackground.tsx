interface Particle {
  id: number;
  type: 'sakura' | 'heart' | 'cat';
  x: number;
  y: number;
}

function mulberry32(seed: number) {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

const PARTICLE_COUNT = 36;
const STATIC_PARTICLES: Particle[] = (() => {
  const rand = mulberry32(1337);
  const items: Particle[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const r = rand();
    items.push({
      id: i,
      type: r < 0.34 ? 'sakura' : r < 0.67 ? 'heart' : 'cat',
      x: rand() * 100,
      y: rand() * 100,
    });
  }
  return items;
})();

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      <div className="absolute inset-0 bg-gradient-to-br from-rose-100/30 via-pink-100/30 to-pink-200/30" />
      {STATIC_PARTICLES.map((particle) => (
        <div
          key={particle.id}
          className="absolute text-4xl opacity-30"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
        >
          {particle.type === 'sakura' ? '🌸' : particle.type === 'heart' ? '💕' : '😺'}
        </div>
      ))}
    </div>
  );
}
