import React, { useMemo } from 'react';
import { AbsoluteFill, spring, useCurrentFrame } from 'remotion';
import * as THREE from 'three';
import { SceneCanvas, SpaceBackdrop } from '../components/SceneCanvas';
import { useScene } from '../components/SceneContext';
import { Label } from '../components/Label';
import { brilliantGeometry, Glow, Sparkles, Stars, useDiamondMaterial } from '../three/parts';
import { Lattice } from '../three/Lattice';
import { ease, easeMulti, windowIn } from '../lib/anim';
import { project, Pose, Vec3 } from '../three/camera';
import { theme } from '../theme';

const Pencil: React.FC<{ position: Vec3; rotation: Vec3; scale: number }> = ({ position, rotation, scale }) => (
  <group position={position} rotation={rotation} scale={Math.max(0.0001, scale)}>
    {/* body: hexagonal, painted */}
    <mesh position={[-5.6, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.62, 0.62, 10, 6]} />
      <meshStandardMaterial color={'#f0b23a'} roughness={0.45} flatShading />
    </mesh>
    {/* ferrule + eraser */}
    <mesh position={[-11, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.64, 0.64, 0.9, 24]} />
      <meshStandardMaterial color={'#c9ccd2'} metalness={0.9} roughness={0.25} />
    </mesh>
    <mesh position={[-11.9, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.6, 0.6, 0.9, 24]} />
      <meshStandardMaterial color={'#e58a96'} roughness={0.8} />
    </mesh>
    {/* sharpened wood */}
    <mesh position={[0.8, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
      <cylinderGeometry args={[0.18, 0.62, 1.6, 6]} />
      <meshStandardMaterial color={'#e6c497'} roughness={0.9} flatShading />
    </mesh>
    {/* graphite tip */}
    <mesh position={[1.85, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
      <coneGeometry args={[0.18, 0.5, 24]} />
      <meshStandardMaterial color={'#2a2f38'} metalness={0.7} roughness={0.3} />
    </mesh>
  </group>
);

export const CarbonScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, isV, beat, length, width, height } = useScene();
  const t = frame / fps;
  const gem = useMemo(brilliantGeometry, []);
  const mat = useDiamondMaterial({ emissive: 0.1 });

  // --- phases
  const gemShrink = easeMulti(frame, [beat(1), beat(1) + 25], [1, isV ? 0.75 : 1]);
  const gemIn = spring({ frame: frame - 4, fps, config: theme.spring.soft });
  const gemOut = ease(frame, [beat(2) - 6, beat(2) + 14], [1, 0], theme.ease.in);
  const atomIn = spring({ frame: frame - beat(1) - 6, fps, config: theme.spring.pop }) * gemOut;
  const pencilIn = spring({ frame: frame - beat(2) - 4, fps, config: theme.spring.soft });
  const pencilOut = ease(frame, [beat(4) - 6, beat(4) + 18], [0, 1], theme.ease.in);
  const grow = ease(frame, [beat(3) + 10, beat(3) + 2.4 * fps], [0, 1], theme.ease.out);
  const morph = ease(frame, [beat(6), beat(6) + Math.max(2 * fps, (beat(7) - beat(6)) * 0.85)], [0, 1], theme.ease.inOut);
  const plates = ease(frame, [beat(5), beat(5) + 25], [0, 1], theme.ease.out) * (1 - ease(frame, [beat(7), beat(7) + 25], [0, 1], theme.ease.in));
  const squeeze = ease(frame, [beat(6), beat(7)], [0, 1], theme.ease.inOut);
  const heat = windowIn(frame, beat(5) + 10, beat(7) + 30, 30, 30);
  const glow = ease(frame, [beat(7) - 10, beat(7) + 30], [0, 1], theme.ease.out);

  const tip: Vec3 = isV ? [1.2, 3.2, 0] : [3.5, 1.2, 0];
  const latticeCenter: Vec3 = [
    easeMulti(frame, [beat(3), beat(4), beat(4) + 30], [tip[0] + 2.2, tip[0] + 2.2, 0]),
    easeMulti(frame, [beat(3), beat(4), beat(4) + 30], [tip[1] - 0.4, tip[1] - 0.4, 0]),
    0,
  ];
  const latScale = easeMulti(frame, [beat(3), beat(4), beat(4) + 30], [0.22, 0.22, 1]);

  // --- camera
  const k = [0, beat(1), beat(2), beat(3), beat(3) + 2 * fps, beat(4) + 30, beat(6), length];
  const camZ = easeMulti(frame, k, isV ? [16, 19, 24, 24, 11, 32, 33, 33] : [11, 12, 18, 18, 8.5, 26, 27, 27]);
  const fx = easeMulti(frame, k, [0, 0, 0, 0, tip[0] + 2, 0, 0, 0]);
  const fy = easeMulti(frame, k, [0, 0, 0, 0, tip[1] - 0.4, 0, 0, 0]);
  const orbit = t * 0.12;
  const pose: Pose = {
    pos: [fx + Math.sin(orbit) * camZ * 0.25, fy + 2.5 + Math.sin(t * 0.3) * 0.3, camZ],
    target: [fx, fy, 0],
    fov: isV ? 58 : 40,
  };

  const gemPos: Vec3 = [easeMulti(frame, [beat(1), beat(1) + 25], [0, isV ? -2.5 : -3.2]), 0, 0];
  const atomPos: Vec3 = isV ? [2.7, 0, 0] : [3.6, 0, 0];
  const W = (p: Vec3) => project(pose, width, height, p);
  const gemL = W([gemPos[0], gemPos[1] + 2.4, 0]);
  const atomL = W([atomPos[0], atomPos[1] + 3, 0]);
  const tipL = W([tip[0] + 2.2, tip[1] - 2.6, 0]);
  const latTop = W([0, 6.4, 0]);
  const plateY = 7.6 - 2.2 * squeeze;

  return (
    <AbsoluteFill>
      <SpaceBackdrop drift={t / 25} glow={`rgba(${Math.round(255 * heat * 0.5)},120,140,0.14)`} />
      <SceneCanvas pose={pose} envIntensity={1.2}>
        <ambientLight intensity={0.2} />
        <directionalLight position={[8, 12, 10]} intensity={2.6} />
        <pointLight position={[0, 0, 8]} intensity={80 * heat} color={theme.color.heat} />
        <Stars count={1600} radius={700} seed={12} opacity={0.7} />

        {/* hero diamond */}
        <group position={gemPos} scale={Math.max(0.0001, 2.2 * gemIn * gemOut * gemShrink)} rotation={[0.35, t * 0.6, 0.12]}>
          <mesh geometry={gem} material={mat} />
        </group>
        <Glow position={gemPos} scale={9 * gemIn * gemOut} opacity={0.35} />
        <Sparkles points={[[gemPos[0] + 1.2, gemPos[1] + 0.6, 1], [gemPos[0] - 1.4, gemPos[1] + 0.2, 1], [gemPos[0] + 0.2, gemPos[1] - 1.2, 1]]} t={t} size={90} intensity={gemIn * gemOut} />

        {/* single carbon atom */}
        <group position={atomPos} scale={Math.max(0.0001, atomIn * 1.3)}>
          <mesh>
            <sphereGeometry args={[1, 48, 32]} />
            <meshPhysicalMaterial color={'#4a5566'} metalness={0.3} roughness={0.25} clearcoat={1} emissive={theme.color.cyan} emissiveIntensity={0.08} />
          </mesh>
          {[0, 1, 2].map((i) => (
            <mesh key={i} rotation={[i * 1.05 + t * 0.5, i * 0.7, t * 0.3 * (i + 1)]}>
              <torusGeometry args={[1.9, 0.025, 8, 96]} />
              <meshBasicMaterial color={theme.color.cyan} transparent opacity={0.7} />
            </mesh>
          ))}
          <Glow scale={5} opacity={0.3} />
        </group>

        {/* pencil */}
        <Pencil
          position={[tip[0] - 2 - pencilOut * 14, tip[1] + 0.2 - pencilOut * 4, 0]}
          rotation={[0.5, 0.25, -0.12]}
          scale={pencilIn * (1 - pencilOut)}
        />

        {/* pressure plates */}
        {plates > 0.001 ? (
          <>
            {[1, -1].map((s) => (
              <mesh key={s} position={[0, s * (plateY + (1 - plates) * 6), 0]} scale={[1, 1, 1]}>
                <boxGeometry args={[9, 0.4, 9]} />
                <meshPhysicalMaterial
                  color={'#9fdcff'}
                  metalness={0.6}
                  roughness={0.15}
                  transparent
                  opacity={0.55 * plates}
                  emissive={theme.color.heat}
                  emissiveIntensity={heat * 0.6}
                />
              </mesh>
            ))}
          </>
        ) : null}

        <Lattice
          morph={morph}
          grow={grow}
          heat={heat}
          glow={glow}
          scale={latScale}
          position={latticeCenter}
          rotation={[0.18, t * 0.15, 0]}
        />
        <Glow position={[0, 0, 0]} scale={18 * heat} color={theme.color.heat} opacity={0.35 * heat} />
        <Glow position={[0, 0, 0]} scale={16 * glow} color={theme.color.cyan} opacity={0.25 * glow} />
      </SceneCanvas>

      <Label anchor="above" x={gemL.x} y={gemL.y} from={10} to={beat(2)} title="Diamond" sub="one of the hardest materials" />
      <Label anchor="above" x={atomL.x} y={atomL.y} from={beat(1) + 12} to={beat(2)} title="C · Carbon" sub="diamond is pure carbon" color={theme.color.ice} />
      <Label anchor="below" x={tipL.x} y={tipL.y} from={beat(3) + 20} to={beat(4)} title="Graphite" sub="pencil “lead” = carbon" />
      <Label anchor="above" x={latTop.x} y={latTop.y} from={beat(4) + 20} to={beat(6) + 10} title="Graphite" sub="carbon in flat, slippery sheets" />
      <Label anchor="above" x={latTop.x} y={latTop.y} from={beat(6) + 20} to={beat(7) + 4} title="Pressure + heat" sub="the sheets buckle and lock together" color={'#ffd2a8'} />
      <Label anchor="above" x={latTop.x} y={latTop.y} from={beat(7) + 10} to={length + 30} title="Diamond" sub="a rigid 3D carbon network" color={theme.color.ice} />
    </AbsoluteFill>
  );
};
