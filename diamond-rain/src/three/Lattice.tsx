import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { lerp, smooth } from '../lib/anim';
import { useInstances } from './parts';
import { theme } from '../theme';
import type { Vec3 } from './camera';

/**
 * Carbon lattice that morphs from graphite (flat honeycomb sheets, AB stacking,
 * 3.35 Å apart) into cubic diamond viewed along [111] (puckered sheets, ABC
 * stacking, 2.05 Å apart, plus vertical bonds between sheets). Units: Å.
 */
const D_G = 1.42;
const D_D = 1.452;
const LAYERS = 4;

type Atom = { g: Vec3; d: Vec3 };

export const buildLattice = (cut = 4.3) => {
  const sites: { i: number; j: number; b: boolean; x: number; z: number }[] = [];
  const a1 = [1.5, Math.sqrt(3) / 2];
  const a2 = [1.5, -Math.sqrt(3) / 2];
  for (let i = -6; i <= 6; i++)
    for (let j = -6; j <= 6; j++)
      for (const b of [false, true]) {
        const x = i * a1[0] + j * a2[0] + (b ? 1 : 0) - 0.5;
        const z = i * a1[1] + j * a2[1];
        if (Math.hypot(x, z) * D_G < cut) sites.push({ i, j, b, x, z });
      }
  const key = (l: number, i: number, j: number, b: boolean) => `${l}:${i}:${j}:${b ? 1 : 0}`;
  const index = new Map<string, number>();
  const atoms: Atom[] = [];
  for (let l = 0; l < LAYERS; l++) {
    const gOff = ((l % 2) - 0.5) * D_G;
    const dOff = (l - (LAYERS - 1) / 2) * D_D;
    for (const s of sites) {
      index.set(key(l, s.i, s.j, s.b), atoms.length);
      atoms.push({
        g: [s.x * D_G + gOff, (l - (LAYERS - 1) / 2) * 3.35, s.z * D_G],
        d: [s.x * D_D + dOff, (l - (LAYERS - 1) / 2) * 2.053 + (s.b ? 0.513 : 0) - 0.256, s.z * D_D],
      });
    }
  }
  const inPlane: [number, number][] = [];
  const vertical: [number, number][] = [];
  for (let l = 0; l < LAYERS; l++)
    for (const s of sites) {
      if (s.b) continue;
      const a = index.get(key(l, s.i, s.j, false))!;
      for (const [di, dj] of [
        [0, 0],
        [-1, 0],
        [0, -1],
      ]) {
        const b = index.get(key(l, s.i + di, s.j + dj, true));
        if (b !== undefined) inPlane.push([a, b]);
      }
      if (l < LAYERS - 1) {
        const b = index.get(key(l, s.i, s.j, true));
        const up = index.get(key(l + 1, s.i, s.j, false));
        if (b !== undefined && up !== undefined) vertical.push([b, up]);
      }
    }
  return { atoms, inPlane, vertical };
};

const Y = new THREE.Vector3(0, 1, 0);
const tmpA = new THREE.Vector3();
const tmpB = new THREE.Vector3();
const dir = new THREE.Vector3();

export const Lattice: React.FC<{
  /** 0 = graphite, 1 = diamond */
  morph: number;
  /** 0..1 grow-in */
  grow?: number;
  glow?: number;
  heat?: number;
  scale?: number;
  position?: Vec3;
  rotation?: Vec3;
}> = ({ morph, grow = 1, glow = 0, heat = 0, scale = 1, position = [0, 0, 0], rotation = [0, 0, 0] }) => {
  const lat = useMemo(() => buildLattice(), []);
  const atomRef = useRef<THREE.InstancedMesh>(null);
  const bondRef = useRef<THREE.InstancedMesh>(null);
  const vRef = useRef<THREE.InstancedMesh>(null);
  const sphere = useMemo(() => new THREE.SphereGeometry(0.34, 24, 16), []);
  const cyl = useMemo(() => new THREE.CylinderGeometry(0.09, 0.09, 1, 10), []);
  const m = smooth(morph);
  // vertical sheets slide in a staggered way: lower layers move first
  const pos = (k: number): Vec3 => {
    const a = lat.atoms[k];
    const layer = Math.round((a.g[1] / 3.35) + (LAYERS - 1) / 2);
    const mm = smooth(morph * 1.3 - layer * 0.1);
    const g = smooth(grow * 1.6 - (Math.hypot(a.g[0], a.g[2]) / 6) * 0.6);
    return [lerp(a.g[0], a.d[0], mm) * g, lerp(a.g[1], a.d[1], mm) * g, lerp(a.g[2], a.d[2], mm) * g];
  };
  const P = lat.atoms.map((_, k) => pos(k));
  const g = Math.max(0.001, smooth(grow));
  useInstances(atomRef, lat.atoms.length, (k, o) => {
    o.position.set(...P[k]);
    o.scale.setScalar(g);
  });
  const bond = (pair: [number, number], o: THREE.Object3D, s: number) => {
    tmpA.set(...P[pair[0]]);
    tmpB.set(...P[pair[1]]);
    dir.subVectors(tmpB, tmpA);
    const len = dir.length();
    o.position.copy(tmpA).addScaledVector(dir, 0.5);
    o.quaternion.setFromUnitVectors(Y, dir.normalize());
    o.scale.set(s, len, s);
  };
  useInstances(bondRef, lat.inPlane.length, (k, o) => bond(lat.inPlane[k], o, g));
  const vs = Math.max(0.001, smooth((m - 0.55) / 0.4));
  useInstances(vRef, lat.vertical.length, (k, o) => {
    bond(lat.vertical[k], o, vs);
    o.scale.y *= vs;
  });
  const atomColor = new THREE.Color('#3c4656').lerp(new THREE.Color('#e9fdff'), m);
  const emissive = new THREE.Color(theme.color.heat).lerp(new THREE.Color(theme.color.cyan), smooth(glow));
  const emissiveI = heat * 0.9 + glow * 0.8;
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <instancedMesh ref={atomRef} args={[sphere, undefined, lat.atoms.length]} frustumCulled={false}>
        <meshPhysicalMaterial
          color={atomColor}
          metalness={0.2 + 0.4 * m}
          roughness={0.35 - 0.3 * m}
          clearcoat={1}
          emissive={emissive}
          emissiveIntensity={emissiveI}
          envMapIntensity={1.4}
        />
      </instancedMesh>
      <instancedMesh ref={bondRef} args={[cyl, undefined, lat.inPlane.length]} frustumCulled={false}>
        <meshStandardMaterial color={atomColor} emissive={emissive} emissiveIntensity={emissiveI * 0.6} roughness={0.4} />
      </instancedMesh>
      <instancedMesh ref={vRef} args={[cyl, undefined, lat.vertical.length]} frustumCulled={false}>
        <meshStandardMaterial color={'#e9fdff'} emissive={theme.color.cyan} emissiveIntensity={0.6 + glow} roughness={0.3} />
      </instancedMesh>
    </group>
  );
};
