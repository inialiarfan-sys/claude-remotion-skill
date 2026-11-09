import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import * as THREE from 'three';
import { SceneCanvas, SpaceBackdrop } from '../components/SceneCanvas';
import { useScene } from '../components/SceneContext';
import { Tag, Title } from '../components/Text';
import { Host } from '../components/Host';
import { ADD, Glow, PlanetBody, Stars, Star } from '../three/parts';
import { galaxyTexture } from '../three/textures';
import { OrbitRing } from '../three/Effects3D';
import { ease, easeMulti, lerp } from '../lib/anim';
import { project, Pose, Vec3 } from '../three/camera';
import { theme } from '../theme';
import { fovFor, hostSpot } from './layout';

const SOLAR: Vec3 = [0, 0, 0];
const OTHER: Vec3 = [900, 0, -520];

const System: React.FC<{ center: Vec3; t: number; planets: number; scale?: number; hd?: boolean }> = ({ center, t, planets, scale = 1, hd }) => (
  <group position={center} scale={scale}>
    <Star radius={1} t={t} />
    {Array.from({ length: planets }, (_, i) => {
      const r = 3 + i * 2.2;
      const a = t * (0.9 / (i + 1)) + i * 1.7;
      return (
        <group key={i}>
          <OrbitRing radius={r} opacity={0.25} />
          {hd && i === 0 ? (
            <PlanetBody kind="hd" radius={0.55} position={[Math.cos(a) * r, 0, Math.sin(a) * r]} t={t} sunDir={[-Math.cos(a), 0, -Math.sin(a)]} heat={0.6} />
          ) : (
            <mesh position={[Math.cos(a) * r, 0, Math.sin(a) * r]} scale={0.22 + (i % 3) * 0.12}>
              <sphereGeometry args={[1, 24, 16]} />
              <meshStandardMaterial color={['#c9a27a', '#7fb2ff', '#e0c08e', '#9fd3c7', '#d98b6b'][i % 5]} roughness={0.8} />
            </mesh>
          )}
        </group>
      );
    })}
  </group>
);

/** 3 · From our Sun, out to the Milky Way, then into a distant star with planets. */
export const NameScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, isV, at, length, width, height } = useScene();
  const t = frame / fps;
  const aNot = at('not in our solar system', 3.9);
  const aSun = at('our sun is just one', 7);
  const aMany = at('many of those stars', 11);
  const aExo = at('call them exoplanets', 13.5);
  // zoom-out (log distance) then fly to the other star and zoom in
  const out = ease(frame, [aSun - 10, aMany], [0, 1], theme.ease.inOut);
  const travel = ease(frame, [aMany - 20, aExo], [0, 1], theme.ease.inOut);
  const zoomIn = ease(frame, [aMany + 10, aExo + 20], [0, 1], theme.ease.inOut);
  const dist = Math.exp(lerp(lerp(Math.log(26), Math.log(2600), out), Math.log(30), zoomIn));
  const elev = lerp(lerp(0.22, 1.05, out), 0.3, zoomIn);
  const target: Vec3 = [lerp(SOLAR[0], OTHER[0], travel), 0, lerp(SOLAR[2], OTHER[2], travel)];
  const yaw = t * 0.03;
  const pose: Pose = {
    pos: [target[0] + Math.sin(yaw) * Math.cos(elev) * dist, target[1] + Math.sin(elev) * dist, target[2] + Math.cos(yaw) * Math.cos(elev) * dist],
    target,
    fov: fovFor(isV, 42),
  };
  const gal = useMemo(
    () => new THREE.MeshBasicMaterial({ map: galaxyTexture(), transparent: true, depthWrite: false, ...ADD }),
    [],
  );
  gal.opacity = ease(frame, [aSun, aSun + 40], [0, 1]) * (1 - zoomIn * 0.85);
  const W = (p: Vec3) => project(pose, width, height, p);
  const here = W(SOLAR);
  const there = W(OTHER);
  const host = hostSpot(isV, 'left');
  const walkX = isV ? lerp(120, 900, ease(frame, [0, length], [0, 1], theme.ease.inOut)) : lerp(110, 290, ease(frame, [0, length], [0, 1], theme.ease.inOut));
  return (
    <AbsoluteFill>
      <SpaceBackdrop drift={t / 30} />
      <SceneCanvas pose={pose}>
        <ambientLight intensity={0.25} />
        <Stars count={3000} radius={4000} seed={31} />
        {/* the Milky Way, seen from above; we sit in a spiral arm */}
        <mesh rotation={[-Math.PI / 2, 0, 0.6]} position={[-700, -2, 400]} material={gal}>
          <planeGeometry args={[5200, 5200]} />
        </mesh>
        <System center={SOLAR} t={t} planets={6} />
        <System center={OTHER} t={t} planets={3} hd />
        <Glow position={OTHER} scale={60 * (1 - zoomIn) + 4} color={theme.color.star} opacity={0.6} />
      </SceneCanvas>
      <Title lines={['HD 189733 b']} from={4} to={aNot + 6} size={isV ? 110 : 124} font={theme.font.body} />
      <Tag text="Our Sun" from={aNot} to={aSun + 20} x={here.x} y={here.y - (isV ? 120 : 90)} color={theme.color.star} />
      <Tag text="Milky Way · billions of stars" from={aSun + 30} to={aMany} x={width / 2} y={isV ? 330 : 150} color={theme.color.sky} />
      <Tag text="You are here" from={aSun + 40} to={aMany - 10} x={here.x} y={here.y - 60} color={theme.color.butter} size={28} />
      <Tag text="Exoplanets" from={aExo} to={length} x={there.x} y={there.y - (isV ? 260 : 200)} color={theme.color.cyan} size={isV ? 48 : 44} />
      <Host x={walkX} y={host.y} height={host.height * 0.9} pose="astronaut" walking />
    </AbsoluteFill>
  );
};
