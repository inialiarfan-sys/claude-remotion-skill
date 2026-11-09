import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import * as THREE from 'three';
import { SceneCanvas, SpaceBackdrop } from '../components/SceneCanvas';
import { useScene } from '../components/SceneContext';
import { Label } from '../components/Label';
import { Stars } from '../three/parts';
import { CutawayPlanet, facePoint, OPEN_FACING, rotY } from '../three/Cutaway';
import { ease, easeMulti, windowIn } from '../lib/anim';
import { project, Pose, Vec3 } from '../three/camera';
import { theme } from '../theme';

/** Arrows pressing in from every side. */
const PressureArrows: React.FC<{ amount: number; t: number; radius: number }> = ({ amount, t, radius }) => {
  const geo = useMemo(() => {
    const g = new THREE.ConeGeometry(0.28, 0.8, 24);
    return g;
  }, []);
  if (amount <= 0.001) return null;
  const n = 8;
  return (
    <group>
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 + Math.PI / 8;
        const pulse = (Math.sin(t * 4 - i * 0.6) + 1) * 0.08;
        const r = radius * (1.75 - 0.25 * amount - pulse);
        return (
          <mesh
            key={i}
            geometry={geo}
            position={[Math.cos(a) * r, Math.sin(a) * r, 0.5]}
            rotation={[0, 0, a + Math.PI / 2]}
            scale={amount * 1.2}
          >
            <meshStandardMaterial color={'#ffe0b0'} emissive={theme.color.heat} emissiveIntensity={1.2} />
          </mesh>
        );
      })}
    </group>
  );
};

export const InsideScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, isV, beat, length, width, height } = useScene();
  const t = frame / fps;
  const R = isV ? 4 : 5;
  const C: Vec3 = [0, 0, 0];

  // Rotate from "whole planet" (wedge away) to cutaway (wedge facing us, angled 30°).
  const open = ease(frame, [beat(3) - 10, beat(3) + 2.4 * fps], [0, 1], theme.ease.inOut);
  const rot = OPEN_FACING + Math.PI * (1 - open) + 0.35 + Math.sin(t * 0.2) * 0.05;
  const heat = 0.15 + 0.85 * ease(frame, [beat(4), beat(4) + 1.5 * fps], [0, 1], theme.ease.out);
  const press = ease(frame, [beat(5), beat(5) + 1.2 * fps], [0, 1], theme.ease.out) * (1 - ease(frame, [beat(6) + 20, beat(6) + 40], [0, 1]));

  const k = [0, beat(3), beat(6), length];
  const camZ = easeMulti(frame, k, isV ? [27, 25, 23, 17] : [26, 25, 26, 19]);
  const camX = easeMulti(frame, k, [-2, 0, 0, -1.2]);
  const pose: Pose = {
    pos: [camX + Math.sin(t * 0.25) * 0.4, C[1] + 3.5 - frame * 0.002, camZ],
    target: [easeMulti(frame, k, [0, 0, 0, -1.2]), C[1] - 0.3, 0],
    fov: isV ? 60 : 40,
  };

  const P = (p: Vec3) => project(pose, width, height, rotY(p, rot, R, C));
  const W = (p: Vec3) => project(pose, width, height, p);
  const labelsOn = beat(3) + 2.2 * fps;
  const atm = P(facePoint(0.87, 0.35));
  const mantle = P(facePoint(0.52, -0.12));
  const core = W(C);
  const top = W([C[0], C[1] + R * 1.34, C[2]]);
  const side = isV ? W([C[0], C[1] - R * 1.2, 0]) : W([C[0] + R * 1.25, C[1] + R * 0.5, 0]);
  const frost = windowIn(frame, 0, beat(3) + 10, 20, 20);

  return (
    <AbsoluteFill>
      <SpaceBackdrop drift={t / 25} />
      <SceneCanvas pose={pose}>
        <ambientLight intensity={0.08} />
        <directionalLight position={[-16, 8, 8]} intensity={3.6} color={'#ffffff'} />
        <pointLight position={[0, 0, 8]} intensity={40 * heat} color={theme.color.heat} />
        <Stars count={2200} radius={900} seed={9} />
        <CutawayPlanet radius={R} position={C} rotation={rot} heat={heat * open} tilt={0.12} />
        <group position={C}>
          <PressureArrows amount={press} t={t} radius={R} />
        </group>
      </SceneCanvas>
      <AbsoluteFill
        style={{
          background: `radial-gradient(60% 45% at 50% ${isV ? 44 : 50}%, rgba(191,246,255,${0.1 * frost}) 0%, rgba(0,0,0,0) 70%)`,
        }}
      />
      <Label anchor="above" x={top.x} y={top.y} from={8} to={beat(1)} title="≈ −200 °C" sub="cold cloud tops" color={theme.color.ice} />
      <Label anchor="above" x={top.x} y={top.y} from={beat(1) + 4} to={beat(3)} title="Ice giants" sub="Uranus · Neptune" size={isV ? 60 : 56} />
      <Label x={side.x} y={side.y} from={beat(2) + 6} to={beat(3) + 10} title="Not a ball of ice" sub="mostly hot, dense fluids" align={isV ? 'center' : 'left'} />
      <Label x={atm.x} y={atm.y} from={labelsOn} to={beat(4)} title="Gas" sub="hydrogen · helium · methane" size={isV ? 34 : 30} align="right" />
      <Label x={mantle.x} y={mantle.y} from={labelsOn + 8} to={beat(4)} title="Hot icy fluid" sub="water · ammonia · methane" size={isV ? 34 : 30} align="right" />
      <Label x={core.x} y={core.y + (isV ? 70 : 60)} from={labelsOn + 16} to={beat(4)} title="Rocky core" size={isV ? 34 : 30} />
      <Label x={core.x} y={core.y + (isV ? 80 : 70)} from={beat(4) + 6} to={beat(5) + 6} title="≈ 5,000 °C" sub="deep inside" color={theme.color.core} size={isV ? 52 : 48} />
      <Label anchor="above" x={top.x} y={top.y} from={beat(5) + 6} to={beat(6) + 30} title="Huge pressure" sub="millions of times Earth's air pressure" color={'#ffe0b0'} size={isV ? 46 : 44} />
    </AbsoluteFill>
  );
};
