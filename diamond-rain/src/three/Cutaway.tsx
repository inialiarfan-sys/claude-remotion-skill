import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Atmosphere, Glow } from './parts';
import { layersTexture, planetTexture } from './textures';
import { theme } from '../theme';
import type { Vec3 } from './camera';

/**
 * Rotation (around Y) that turns the open wedge of the cutaway toward +Z (the camera).
 * The shell covers phi ∈ [0, 1.5π]; the missing quarter is centred on (-1, 0, -1).
 */
export const OPEN_FACING = (3 * Math.PI) / 4;

/** Rotate a local point of the cutaway group around Y (for label projection). */
export const rotY = (p: Vec3, a: number, scale = 1, offset: Vec3 = [0, 0, 0]): Vec3 => {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [
    (p[0] * c + p[2] * s) * scale + offset[0],
    p[1] * scale + offset[1],
    (-p[0] * s + p[2] * c) * scale + offset[2],
  ];
};

/** A local point on the cut face that extends toward -X, at radius r (0..1) and height y. */
export const facePoint = (r: number, y = 0): Vec3 => [-Math.sqrt(Math.max(0, r * r - y * y)), y, 0.001];

export const CutawayPlanet: React.FC<{
  radius: number;
  position?: Vec3;
  /** Y rotation of the whole planet */
  rotation: number;
  tilt?: number;
  heat?: number;
  children?: React.ReactNode;
}> = ({ radius, position = [0, 0, 0], rotation, tilt = 0, heat = 0.4, children }) => {
  const shell = useMemo(() => new THREE.SphereGeometry(1, 128, 96, 0, Math.PI * 1.5), []);
  const half = useMemo(() => new THREE.CircleGeometry(1, 128, Math.PI / 2, Math.PI), []);
  const faceMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: layersTexture(),
        emissiveMap: layersTexture(),
        emissive: new THREE.Color('#ffffff'),
        roughness: 0.7,
        side: THREE.DoubleSide,
      }),
    [],
  );
  faceMat.emissiveIntensity = 0.35 + heat * 0.5;
  return (
    <group position={position} rotation={[tilt, 0, 0]} scale={radius}>
      <group rotation={[0, rotation, 0]}>
        <mesh geometry={shell}>
          <meshStandardMaterial map={planetTexture('neptune')} roughness={0.8} envMapIntensity={0.15} side={THREE.FrontSide} />
        </mesh>
        <mesh geometry={half} material={faceMat} />
        <mesh geometry={half} material={faceMat} rotation={[0, -Math.PI / 2, 0]} />
        {children}
      </group>
      <Atmosphere radius={1} color={'#4f8bff'} intensity={1.2} />
      <Glow scale={0.75 + heat * 0.9} color={theme.color.heat} opacity={0.35 + heat * 0.6} />
      <Glow scale={0.3 + heat * 0.3} color={theme.color.core} opacity={0.5 + heat * 0.5} />
    </group>
  );
};
