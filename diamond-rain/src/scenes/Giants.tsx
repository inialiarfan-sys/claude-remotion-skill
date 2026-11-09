import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame } from 'remotion';
import { SceneCanvas, SpaceBackdrop } from '../components/SceneCanvas';
import { useScene } from '../components/SceneContext';
import { Label } from '../components/Label';
import { Glow, Planet, Stars } from '../three/parts';
import { ease, easeMulti, windowIn } from '../lib/anim';
import { project, Pose, Vec3 } from '../three/camera';
import { theme } from '../theme';

/** Scale bar: how far the ice giants are (AU, to scale). */
const DistanceBar: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const frame = useCurrentFrame();
  const { fps, isV, width } = useScene();
  const o = windowIn(frame, from, to, 16, 12);
  if (o <= 0) return null;
  const draw = ease(frame, [from + 6, from + 6 + 2 * fps], [0, 1], theme.ease.out);
  const left = isV ? 90 : 220;
  const right = isV ? width - 190 : width - 220;
  const len = right - left;
  const top = isV ? 1010 : 150;
  const max = 30.1;
  const stops = [
    { au: 0, name: 'Sun', sub: '', color: '#ffd27a', r: 16 },
    { au: 1, name: 'Earth', sub: '', color: '#6fb6ff', r: 9 },
    { au: 19.2, name: 'Uranus', sub: '≈ 2.9 billion km', color: theme.color.uranus, r: 13 },
    { au: 30.1, name: 'Neptune', sub: '≈ 4.5 billion km', color: '#5d8bff', r: 13 },
  ];
  const fsz = isV ? 30 : 28;
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', opacity: o, fontFamily: theme.font.body }}>
      <div
        style={{
          position: 'absolute',
          left: left - 40,
          width: len + 80,
          top: top - (isV ? 290 : 120),
          height: isV ? 400 : 230,
          borderRadius: 28,
          background: 'rgba(2,8,22,0.86)',
          border: '1px solid rgba(191,246,255,0.18)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left,
          top: top - (isV ? 250 : 92),
          fontSize: isV ? 32 : 30,
          fontWeight: 800,
          letterSpacing: isV ? 3 : 6,
          color: theme.color.text,
          textShadow: '0 2px 12px rgba(0,0,0,0.9)',
        }}
      >
        DISTANCE FROM THE SUN · TO SCALE
      </div>
      <div
        style={{
          position: 'absolute',
          left,
          top,
          width: len * draw,
          height: 3,
          background: `linear-gradient(90deg, #ffd27a, ${theme.color.cyan})`,
          boxShadow: `0 0 12px ${theme.color.cyan}`,
        }}
      />
      {stops.map((s, i) => {
        const x = left + (s.au / max) * len;
        const p = spring({ frame: frame - from - 8 - (s.au / max) * 2 * fps - i * 3, fps, config: theme.spring.pop });
        const below = i === 1;
        return (
          <div key={s.name} style={{ position: 'absolute', left: x, top, transform: `translate(-50%, -50%) scale(${p})` }}>
            <div
              style={{
                width: s.r * 2,
                height: s.r * 2,
                borderRadius: 99,
                background: s.color,
                boxShadow: `0 0 18px ${s.color}`,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: below ? 26 : undefined,
                bottom: below ? undefined : 34,
                transform: `translateX(${i === 3 ? '-80%' : i <= 1 ? '-30%' : '-50%'})`,
                textAlign: 'center',
                whiteSpace: 'nowrap',
                color: theme.color.text,
                fontWeight: 700,
                fontSize: fsz,
                textShadow: '0 2px 10px rgba(0,0,0,0.95)',
              }}
            >
              {s.name}
              {s.sub ? <div style={{ fontWeight: 500, fontSize: fsz * 0.8, color: theme.color.textDim }}>{s.sub}</div> : null}
            </div>
          </div>
        );
      })}
      <div
        style={{
          position: 'absolute',
          left,
          width: len,
          top: top + (isV ? -200 : 60),
          textAlign: isV ? 'left' : 'right',
          fontSize: isV ? 30 : 28,
          fontWeight: 500,
          color: theme.color.textDim,
          opacity: ease(frame, [from + 2.2 * fps, from + 2.8 * fps], [0, 1], theme.ease.out),
          textShadow: '0 2px 10px rgba(0,0,0,0.95)',
        }}
      >
        Sunlight takes over 4 hours to reach Neptune
      </div>
    </div>
  );
};

export const GiantsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, isV, beat, length, width, height } = useScene();
  const t = frame / fps;

  const U: Vec3 = isV ? [-2.4, 3.6, 0] : [-7.5, 0.4, 0];
  const N: Vec3 = isV ? [2.3, -3.4, -2] : [7.5, -0.4, -2];
  const E: Vec3 = isV ? [3.2, 1.6, 3] : [0, 3.2, 3];
  const R = isV ? 2.9 : 4;

  // Camera: fly-by → pull back for distance → push toward Neptune → back to both → Earth.
  const k = [0, beat(1), beat(2), beat(4), beat(5), length];
  const camZ = easeMulti(frame, k, isV ? [30, 50, 22, 14, 30, 33] : [26, 40, 21, 13, 27, 29]);
  const camX = easeMulti(frame, k, isV ? [-7, -2, 2, N[0] * 0.8, 0, 0.5] : [-11, -2, 4, N[0] * 0.9, 0, 1]);
  const camY = easeMulti(frame, k, isV ? [3, 9, 0, N[1] * 0.6, 1, 1.5] : [3, -3, 0, N[1] * 0.6, 1, 1.5]);
  const tgt = easeMulti(frame, k, [0, 0, 0.6, 1, 0, 0]);
  const pose: Pose = {
    pos: [camX + Math.sin(t * 0.3) * 0.4, camY, camZ],
    target: [N[0] * tgt, N[1] * tgt, 0],
    fov: isV ? 60 : 40,
  };

  const dim = 1 - (isV ? 0.7 : 0.45) * windowIn(frame, beat(1), beat(2) + 10, 14, 14);
  const earthIn = spring({ frame: frame - beat(5) - 4, fps, config: theme.spring.soft });
  const L = (p: Vec3) => project(pose, width, height, p);
  const uL = L([U[0], U[1] + R * 1.2, U[2]]);
  const nL = L([N[0], N[1] + (isV ? -R * 1.2 : R * 1.2), N[2]]);
  const eL = L([E[0], E[1] + 1.3, E[2]]);
  const nameTo = beat(1) - 4;

  return (
    <AbsoluteFill>
      <SpaceBackdrop drift={t / 25} glow="rgba(31,79,209,0.18)" />
      <SceneCanvas pose={pose}>
        <ambientLight intensity={0.05} />
        <directionalLight position={[-30, 8, 6]} intensity={4 * dim} color={'#fff6e8'} />
        <Stars count={2600} radius={900} size={isV ? 3.2 : 2.8} seed={4} />
        <Planet kind="uranus" radius={R} position={U} tilt={1.7} spin={t * 0.06} rings />
        <Planet kind="neptune" radius={R * 0.97} position={N} spin={0.6 + t * 0.07} />
        <group position={E} scale={Math.max(0.0001, earthIn)}>
          <Planet kind="earth" radius={R / 3.9} spin={t * 0.4} />
          <Glow scale={2.2} color={'#7fb8ff'} opacity={0.25} />
        </group>
      </SceneCanvas>

      <Label x={uL.x} y={uL.y} from={10} to={nameTo} title="Uranus" sub="7th planet from the Sun" dot anchor="above" />
      <Label x={nL.x} y={nL.y} from={22} to={nameTo} title="Neptune" sub="8th planet from the Sun" dot anchor={isV ? 'below' : 'above'} />
      <DistanceBar from={beat(1)} to={beat(2) + 12} />
      <Label x={uL.x} y={uL.y} from={beat(4)} to={beat(5) - 2} title="Uranus" dot anchor="above" />
      <Label x={nL.x} y={nL.y} from={beat(4) + 6} to={beat(5) - 2} title="Neptune" dot anchor={isV ? 'below' : 'above'} />
      <Label anchor="above" x={eL.x} y={eL.y} from={beat(5) + 10} to={length + 30} title="Earth" sub="Each giant is ~4× wider" size={isV ? 40 : 36} />
    </AbsoluteFill>
  );
};
