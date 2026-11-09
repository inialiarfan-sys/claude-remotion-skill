import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import * as THREE from 'three';
import { SceneCanvas, SpaceBackdrop } from '../components/SceneCanvas';
import { useScene } from '../components/SceneContext';
import { Label } from '../components/Label';
import { Glow, Inst, octaGeometry, Sparkles, Stars, useDiamondMaterial } from '../three/parts';
import { ease, easeMulti, lerp, mulberry32, smooth } from '../lib/anim';
import { project, Pose, Vec3 } from '../three/camera';
import { theme } from '../theme';

const TETRA: Vec3[] = [
  [1, 1, 1],
  [1, -1, -1],
  [-1, 1, -1],
  [-1, -1, 1],
].map((v) => v.map((x) => x / Math.sqrt(3)) as Vec3);

const N = 36;
const K = 7;
const Y = new THREE.Vector3(0, 1, 0);

export const MethaneScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, isV, beat, beatEnd, length, width, height } = useScene();
  const t = frame / fps;

  const box: Vec3 = isV ? [4.2, 5.2, 2.5] : [10, 4, 3];
  const mols = useMemo(() => {
    const r = mulberry32(31);
    return Array.from({ length: N }, (_, i) => ({
      p: [(r() * 2 - 1) * box[0], (r() * 2 - 1) * box[1], (r() * 2 - 1) * box[2]] as Vec3,
      rot: new THREE.Euler(r() * 6, r() * 6, r() * 6),
      w: 0.3 + r() * 0.8,
      ph: r() * 6,
      k: i % K,
      slot: Math.floor(i / K),
      hdir: TETRA.map(() => [r() * 2 - 1, r() * 2 - 1, r() * 2 - 1] as Vec3),
    }));
  }, [box[0], box[1], box[2]]);
  const centers = useMemo(() => {
    const r = mulberry32(77);
    return Array.from({ length: K }, (_, k) => {
      const a = (k / K) * Math.PI * 2 + 0.3;
      return [Math.cos(a) * box[0] * 0.55 + (r() - 0.5), Math.sin(a) * box[1] * 0.55 + (r() - 0.5), (r() - 0.5) * 2] as Vec3;
    });
  }, [box[0], box[1]]);

  // phases
  const b0len = beatEnd(0) - beat(0);
  const breakP = ease(frame, [beat(0) + b0len * 0.45, beatEnd(0) + 6], [0, 1], theme.ease.inOut);
  const highlight = ease(frame, [beat(1), beat(1) + 15], [0, 1], theme.ease.out);
  const clump = ease(frame, [beat(2), beat(2) + Math.max(40, (beatEnd(2) - beat(2)) * 0.7)], [0, 1], theme.ease.inOut);
  const crystal = ease(frame, [beatEnd(2) - 18, beatEnd(2) + 12], [0, 1], theme.ease.out);
  const fall = Math.max(0, frame - beat(3)) / fps;
  const heat = ease(frame, [0, beat(0) + b0len * 0.45], [0.3, 1], theme.ease.inOut);

  const carbonPos = (i: number): Vec3 => {
    const m = mols[i];
    const drift: Vec3 = [
      m.p[0] + Math.sin(t * m.w + m.ph) * 0.5,
      m.p[1] + Math.cos(t * m.w * 0.8 + m.ph) * 0.5,
      m.p[2] + Math.sin(t * 0.5 + m.ph) * 0.4,
    ];
    const c = centers[m.k];
    const a = m.slot * 2.1 + t;
    const target: Vec3 = [c[0] + Math.cos(a) * 0.45, c[1] + Math.sin(a) * 0.45, c[2] + Math.sin(a * 1.3) * 0.3];
    const s = smooth(clump);
    return [lerp(drift[0], target[0], s), lerp(drift[1], target[1], s), lerp(drift[2], target[2], s)];
  };
  const C = mols.map((_, i) => carbonPos(i));
  const hPos = (i: number, j: number): Vec3 => {
    const m = mols[i];
    const v = new THREE.Vector3(...TETRA[j]).applyEuler(new THREE.Euler(m.rot.x + t * m.w, m.rot.y + t * 0.4, m.rot.z));
    const fly = smooth(breakP);
    const d = 1.25 + fly * 9;
    const wob = m.hdir[j];
    return [
      C[i][0] + v.x * d + wob[0] * fly * 3,
      C[i][1] + v.y * d + wob[1] * fly * 3 + fly * 2,
      C[i][2] + v.z * d + wob[2] * fly * 3,
    ];
  };

  const sph = useMemo(() => new THREE.SphereGeometry(1, 24, 16), []);
  const cyl = useMemo(() => new THREE.CylinderGeometry(0.08, 0.08, 1, 8), []);
  const octa = useMemo(octaGeometry, []);
  const dmat = useDiamondMaterial({ emissive: 0.25 });

  const cScale = 0.55 * (1 - smooth(crystal));
  const writeC = (i: number, o: THREE.Object3D) => {
    o.position.set(...C[i]);
    o.scale.setScalar(Math.max(0.0001, cScale));
  };
  const hScale = 0.32 * (1 - smooth(breakP * 1.1));
  const writeH = (k: number, o: THREE.Object3D) => {
    o.position.set(...hPos(Math.floor(k / 4), k % 4));
    o.scale.setScalar(Math.max(0.0001, hScale));
  };
  const tmpA = new THREE.Vector3();
  const tmpB = new THREE.Vector3();
  const bondS = Math.max(0.0001, 1 - smooth(breakP * 3));
  const writeB = (k: number, o: THREE.Object3D) => {
    const i = Math.floor(k / 4);
    tmpA.set(...C[i]);
    tmpB.set(...hPos(i, k % 4));
    const dir = tmpB.clone().sub(tmpA);
    const len = Math.min(dir.length(), 1.25);
    o.position.copy(tmpA).addScaledVector(dir.normalize(), len / 2);
    o.quaternion.setFromUnitVectors(Y, dir);
    o.scale.set(bondS, len * bondS, bondS);
  };
  const diamondPos = (k: number): Vec3 => {
    const c = centers[k];
    const d = fall * fall * 2.2 + fall * 1.5;
    return [c[0] + Math.sin(fall * 0.8 + k) * 0.3 * Math.min(1, fall), c[1] - d, c[2]];
  };
  const writeD = (k: number, o: THREE.Object3D) => {
    o.position.set(...diamondPos(k));
    o.rotation.set(t * 0.8 + k, t * 1.1 + k * 2, 0);
    o.scale.setScalar(Math.max(0.0001, 0.75 * smooth(crystal)));
  };

  const pose: Pose = {
    pos: [Math.sin(t * 0.12) * 3, 1.5 - easeMulti(frame, [beat(3), length], [0, 3]), easeMulti(frame, [0, beat(1), beat(2), length], isV ? [34, 31, 27, 29] : [26, 24, 21, 23])],
    target: [0, -easeMulti(frame, [beat(3), length], [0, 4]), 0],
    fov: isV ? 58 : 40,
    shift: isV ? 0.17 : 0.05,
  };
  const W = (p: Vec3) => project(pose, width, height, p);
  const firstC = W([C[0][0], C[0][1] + 1.8, C[0][2]]);
  const topL = W([0, box[1] + 1.2, 0]);
  const dL = W([diamondPos(0)[0], diamondPos(0)[1] + 1.3, diamondPos(0)[2]]);

  return (
    <AbsoluteFill>
      <SpaceBackdrop tint="#05122a" glow={`rgba(255,138,61,${0.1 + 0.14 * heat})`} drift={t / 20} />
      <AbsoluteFill
        style={{
          background: `radial-gradient(70% 55% at 50% ${isV ? 40 : 50}%, rgba(31,181,184,0.18) 0%, rgba(0,0,0,0) 70%)`,
        }}
      />
      <SceneCanvas pose={pose}>
        <ambientLight intensity={0.25} />
        <directionalLight position={[6, 10, 12]} intensity={2.4} />
        <pointLight position={[0, -6, 6]} intensity={160 * heat} color={theme.color.heat} />
        <Stars count={900} radius={300} seed={21} size={4} opacity={0.5} />
        <Inst count={N} geometry={sph} write={writeC}>
          <meshPhysicalMaterial
            color={'#4a5566'}
            metalness={0.3}
            roughness={0.25}
            clearcoat={1}
            emissive={theme.color.cyan}
            emissiveIntensity={0.05 + highlight * 0.55}
          />
        </Inst>
        <Inst count={N * 4} geometry={sph} write={writeH}>
          <meshStandardMaterial color={'#f4f7ff'} roughness={0.3} emissive={'#ffffff'} emissiveIntensity={0.15} />
        </Inst>
        <Inst count={N * 4} geometry={cyl} write={writeB}>
          <meshStandardMaterial color={'#c9d6e6'} roughness={0.4} />
        </Inst>
        <Inst count={K} geometry={octa} material={dmat} write={writeD} />
        {centers.map((_, k) => (
          <Glow key={k} position={diamondPos(k)} scale={3.2 * smooth(crystal)} opacity={0.5 * smooth(crystal)} />
        ))}
        <Sparkles points={centers.map((_, k) => diamondPos(k))} t={t} size={90} intensity={smooth(crystal)} rate={1.6} />
        {/* flash when the diamonds crystallise */}
        {centers.map((_, k) => (
          <Glow key={'f' + k} position={centers[k]} scale={7 * Math.sin(Math.PI * crystal)} color={'#ffffff'} opacity={0.6 * Math.sin(Math.PI * crystal)} />
        ))}
      </SceneCanvas>
      <Label anchor="above" x={firstC.x} y={firstC.y} from={14} to={beat(0) + b0len * 0.45} title="Methane" sub="1 carbon + 4 hydrogen" size={isV ? 38 : 34} />
      <Label anchor="above" x={topL.x} y={topL.y} from={beat(0) + b0len * 0.45} to={beat(1)} title="Heat + pressure" sub="the molecules break apart" color={'#ffd2a8'} />
      <Label anchor="above" x={topL.x} y={topL.y} from={beat(1) + 4} to={beat(2) + 10} title="Carbon is left behind" color={theme.color.ice} />
      <Label anchor="above" x={topL.x} y={topL.y} from={beat(2) + 14} to={beatEnd(2)} title="Carbon clumps together" />
      <Label anchor="above" x={dL.x} y={dL.y} from={beatEnd(2) - 6} to={beat(3) + 20} title="Tiny diamonds" color={theme.color.ice} size={isV ? 40 : 36} />
    </AbsoluteFill>
  );
};
