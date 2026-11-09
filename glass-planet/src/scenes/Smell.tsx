import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import * as THREE from 'three';
import { SceneCanvas, SpaceBackdrop } from '../components/SceneCanvas';
import { useScene } from '../components/SceneContext';
import { Tag } from '../components/Text';
import { Host } from '../components/Host';
import { PlanetBody, Stars } from '../three/parts';
import { ease } from '../lib/anim';
import type { Pose } from '../three/camera';
import { theme } from '../theme';
import { fovFor, hostSpot } from './layout';

/** Stylised James Webb Space Telescope: 18 gold hexagons, secondary mirror, 5-layer sunshield. */
const JWST: React.FC<{ t: number }> = ({ t }) => {
  const gold = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#f0c25a', metalness: 1, roughness: 0.15, clearcoat: 1, envMapIntensity: 2.2 }), []);
  const shield = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: '#c9b6e8', metalness: 0.9, roughness: 0.25, side: THREE.DoubleSide, iridescence: 0.6, envMapIntensity: 1.5 }),
    [],
  );
  const hexes: [number, number][] = [];
  const s = 0.62;
  for (let q = -2; q <= 2; q++)
    for (let r = -2; r <= 2; r++) {
      const z = -q - r;
      const ring = Math.max(Math.abs(q), Math.abs(r), Math.abs(z));
      if (ring === 0 || ring > 2) continue;
      hexes.push([s * Math.sqrt(3) * (q + r / 2), s * 1.5 * r]);
    }
  return (
    <group rotation={[0.35, t * 0.25 - 0.5, 0.05]}>
      {/* primary mirror */}
      <group position={[0, 1.1, 0]} rotation={[-0.25, 0, 0]}>
        {hexes.map(([x, y], i) => (
          <mesh key={i} position={[x, y, 0]} rotation={[Math.PI / 2, Math.PI / 6, 0]} material={gold}>
            <cylinderGeometry args={[s * 0.97, s * 0.97, 0.08, 6]} />
          </mesh>
        ))}
        {/* secondary mirror on struts */}
        {[0, 2.1, 4.2].map((a, i) => (
          <mesh key={i} position={[Math.cos(a) * 0.9, Math.sin(a) * 0.9, 1.2]} rotation={[Math.PI / 2 - 0.6 * Math.sin(a), 0, -0.6 * Math.cos(a)]}>
            <cylinderGeometry args={[0.03, 0.03, 2.6, 6]} />
            <meshStandardMaterial color="#cfd6e0" metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
        <mesh position={[0, 0, 2.3]} rotation={[Math.PI / 2, 0, 0]} material={gold}>
          <cylinderGeometry args={[0.28, 0.28, 0.06, 6]} />
        </mesh>
      </group>
      {/* sunshield: 5 kite-shaped layers */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[0, -1.2 - i * 0.1, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 4]} scale={[3.6 - i * 0.12, 2.3 - i * 0.08, 1]} material={shield}>
          <planeGeometry args={[1.4, 1.4]} />
        </mesh>
      ))}
    </group>
  );
};

/** 12 · Rotten eggs: JWST found hydrogen sulfide (H₂S). The host's helmet gets a stink cloud. */
export const SmellScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, isV, at, length, width } = useScene();
  const t = frame / fps;
  const aWebb = at('james webb space telescope', 3);
  const aH2S = at('hydrogen sulfide', 6.2);
  const aEggs = at('eggs', 10.9); // best match is the word "eggs" (not "egg" in the first line)
  const pose: Pose = { pos: [Math.sin(t * 0.2) * 1.5, 1.2, isV ? 15 : 10.5], target: [0, 0.3, 0], fov: fovFor(isV, 40) };
  const tele = ease(frame, [aWebb - 20, aWebb + 10], [0, 1], theme.ease.out);
  const host = hostSpot(isV, 'right');
  return (
    <AbsoluteFill>
      <SpaceBackdrop warm={0.18} glow="rgba(160,210,90,0.10)" />
      <SceneCanvas pose={pose} envIntensity={1.2}>
        <ambientLight intensity={0.25} />
        <directionalLight position={[5, 6, 8]} intensity={2.6} />
        <Stars count={2000} radius={500} seed={121} />
        <PlanetBody kind="hd" radius={2.4} position={[isV ? 2.5 : 6, isV ? -5.5 : -1.5, -10]} t={t} sunDir={[0.6, 0.4, 0.7]} heat={0.3} ambient={0.03} />
        <group scale={Math.max(0.0001, tele * (isV ? 0.8 : 1))} position={[isV ? -0.3 : -0.5, isV ? -0.6 : 0.2, 0]}>
          <JWST t={t} />
        </group>
      </SceneCanvas>
      <Tag text="James Webb Space Telescope" from={aWebb + 6} to={aH2S - 4} x={isV ? 490 : width / 2} y={isV ? 330 : 140} color={theme.color.butter} size={isV ? 32 : 38} />
      <Tag
        text={<span>H<sub style={{ fontSize: '0.6em' }}>2</sub>S · hydrogen sulfide</span>}
        from={aH2S}
        to={length}
        x={isV ? 490 : width / 2}
        y={isV ? 330 : 140}
        color={theme.color.stink}
        size={isV ? 44 : 48}
      />
      <Host
        x={host.x}
        y={host.y + Math.sin(t * 1.4) * 8}
        height={host.height}
        pose="astronaut"
        poseAt={aEggs}
        rotate={Math.sin(t) * 3}
        bubbles={[
          { expr: 'embarrassed', from: aEggs + 4, hold: 1.3 },
          { expr: 'angry', from: aEggs + 4 + Math.round(1.35 * fps), hold: 1.6 },
        ]}
        fx={[
          { type: 'stink', from: aEggs, to: length },
          { type: 'paw', from: aEggs + 8, to: length },
        ]}
        bubbleSide="left"
      />
    </AbsoluteFill>
  );
};
