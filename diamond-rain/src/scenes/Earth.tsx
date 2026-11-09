import React, { useMemo } from 'react';
import { AbsoluteFill, spring, useCurrentFrame } from 'remotion';
import * as THREE from 'three';
import { SceneCanvas, SpaceBackdrop } from '../components/SceneCanvas';
import { useScene } from '../components/SceneContext';
import { Label } from '../components/Label';
import { brilliantGeometry, Glow, Planet, Sparkles, Stars, useDiamondMaterial } from '../three/parts';
import { ease, easeMulti, mulberry32 } from '../lib/anim';
import { project, Pose, Vec3 } from '../three/camera';
import { theme } from '../theme';

const Ring: React.FC<{ t: number }> = ({ t }) => {
  const gem = useMemo(brilliantGeometry, []);
  const mat = useDiamondMaterial({ emissive: 0.12 });
  const gold = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: theme.color.gold, metalness: 1, roughness: 0.18, clearcoat: 0.6, envMapIntensity: 1.6 }),
    [],
  );
  return (
    <group rotation={[0.25, t * 0.35, 0.08]}>
      <mesh material={gold}>
        <torusGeometry args={[1, 0.11, 32, 128]} />
      </mesh>
      {/* setting */}
      <mesh material={gold} position={[0, 1.12, 0]}>
        <cylinderGeometry args={[0.22, 0.14, 0.22, 24]} />
      </mesh>
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        return (
          <mesh key={i} material={gold} position={[Math.cos(a) * 0.3, 1.38, Math.sin(a) * 0.3]} rotation={[Math.sin(a) * 0.4, 0, -Math.cos(a) * 0.4]}>
            <cylinderGeometry args={[0.03, 0.035, 0.42, 8]} />
          </mesh>
        );
      })}
      <mesh geometry={gem} material={mat} position={[0, 1.5, 0]} scale={0.42} rotation={[0, t * 0.2, 0]} />
    </group>
  );
};

export const EarthScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, isV, beat, length, width, height } = useScene();
  const t = frame / fps;

  const pull = ease(frame, [beat(4) - 6, beat(4) + 4.5 * fps], [0, 1], theme.ease.inOut);
  const planetIn = ease(frame, [beat(4) - 6, beat(4) + 2.5 * fps], [0, 1], theme.ease.out);
  const caseIn = spring({ frame: frame - beat(3), fps, config: theme.spring.soft }) * (1 - ease(frame, [beat(4) - 10, beat(4) + 20], [0, 1]));
  const camZ = easeMulti(frame, [0, beat(3), beat(4) - 6, beat(4) + 4.5 * fps, length], isV ? [6.6, 6, 7.2, 150, 165] : [4.6, 4.3, 5.2, 115, 125]);
  const camY = easeMulti(frame, [0, beat(4) - 6, beat(4) + 4.5 * fps, length], [1.1, 1.1, 8, 10]);
  const pose: Pose = {
    pos: [Math.sin(t * 0.15) * 0.6 * (1 - pull), camY, camZ],
    target: [0, easeMulti(frame, [0, beat(4) - 6, beat(4) + 4.5 * fps], [0.6, 0.6, -6]), easeMulti(frame, [beat(4) - 6, beat(4) + 4.5 * fps], [0, -60])],
    fov: isV ? 56 : 40,
  };
  const NP: Vec3 = [0, -6, -150];
  const NR = isV ? 48 : 52;
  const glints = useMemo(() => {
    const r = mulberry32(3);
    return Array.from({ length: 60 }, () => [(r() * 2 - 1) * NR * 0.7, (r() * 2 - 1) * NR * 0.7, r()] as Vec3);
  }, [NR]);
  const rainPts = glints.map((g, i): Vec3 => {
    const fallY = ((g[1] + NR * 0.7 - t * 3 * (0.6 + (i % 5) * 0.15)) % (NR * 1.4) + NR * 1.4) % (NR * 1.4) - NR * 0.7;
    return [NP[0] + g[0], NP[1] + fallY, NP[2] + NR + 1];
  });
  const rainOn = ease(frame, [beat(5), beat(5) + 30], [0, 1], theme.ease.out);
  const W = (p: Vec3) => project(pose, width, height, p);
  const ringL = W([0, 2.35, 0]);
  const planetL = W([NP[0], NP[1] + NR * 1.08, NP[2]]);

  return (
    <AbsoluteFill>
      <SpaceBackdrop tint={'#0b0f1e'} glow={`rgba(231,192,112,${0.16 * (1 - pull)})`} drift={t / 30} />
      <SceneCanvas pose={pose} envIntensity={1.3}>
        <ambientLight intensity={0.15} />
        <spotLight position={[2, 6, 4]} angle={0.5} penumbra={0.7} intensity={120 * (1 - pull)} color={'#fff1d6'} />
        <directionalLight position={[-220, 60, -60]} intensity={3.4 * planetIn} color={'#ffffff'} />
        <Stars count={2400} radius={1400} seed={51} opacity={0.4 + 0.6 * pull} />
        <Ring t={t} />
        <Glow position={[0, 1.6, 0.2]} scale={1.6} opacity={0.45 * (1 - pull)} color={'#ffffff'} />
        <Sparkles points={[[0.25, 1.75, 0.4], [-0.2, 1.45, 0.4], [0.05, 1.6, 0.5]]} t={t} size={70} intensity={1 - pull * 0.8} rate={1.2} />
        {/* museum display case */}
        {caseIn > 0.001 ? (
          <group scale={caseIn}>
            <mesh position={[0, 0.7, 0]}>
              <boxGeometry args={[3, 3.2, 3]} />
              <meshPhysicalMaterial color={'#cfeaff'} transparent opacity={0.06} roughness={0.05} metalness={0} side={THREE.DoubleSide} depthWrite={false} />
            </mesh>
            <lineSegments position={[0, 0.7, 0]}>
              <edgesGeometry args={[new THREE.BoxGeometry(3, 3.2, 3)]} />
              <lineBasicMaterial color={'#dff4ff'} transparent opacity={0.5} />
            </lineSegments>
            <mesh position={[0, -1.3, 0]}>
              <boxGeometry args={[3.2, 0.8, 3.2]} />
              <meshStandardMaterial color={'#1b1f2a'} metalness={0.4} roughness={0.5} />
            </mesh>
          </group>
        ) : null}
        <Planet kind="neptune" radius={Math.max(0.001, NR * planetIn)} position={NP} spin={t * 0.03} />
        <Sparkles points={rainPts} t={t} size={46} intensity={rainOn} rate={1.6} />
      </SceneCanvas>
      <Label anchor="above" x={ringL.x} y={ringL.y} from={beat(1) + 6} to={beat(2)} title="Rare · Expensive" color={theme.color.gold} />
      <Label anchor="above" x={ringL.x} y={ringL.y} from={beat(2) + 6} to={beat(3)} title="Jewellery" color={theme.color.gold} />
      <Label anchor="above" x={ringL.x} y={ringL.y} from={beat(3) + 6} to={beat(4) - 4} title="Museum treasure" color={theme.color.gold} />
      <Label anchor="above" x={planetL.x} y={planetL.y} from={beat(4) + 3.5 * fps} to={beat(6)} title="Forming naturally?" sub="deep inside Neptune and Uranus" color={theme.color.ice} />
      <Label anchor="above" x={planetL.x} y={planetL.y} from={beat(6) + 6} to={length + 30} title="So much to learn" />
    </AbsoluteFill>
  );
};
