import React, { useMemo, useRef } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import * as THREE from 'three';
import { SceneCanvas } from '../components/SceneCanvas';
import { useScene } from '../components/SceneContext';
import { Label } from '../components/Label';
import { ADD, Glow, Sparkles, useDiamondMaterial, useInstances } from '../three/parts';
import { ease, easeMulti, mulberry32, smooth } from '../lib/anim';
import { project, Pose, Vec3 } from '../three/camera';
import { theme } from '../theme';

const SAMPLE: Vec3 = [0, 1.6, 0];
const Y = new THREE.Vector3(0, 1, 0);

const Beam: React.FC<{ from: Vec3; to: Vec3; on: number; t: number }> = ({ from, to, on, t }) => {
  const a = new THREE.Vector3(...from);
  const b = new THREE.Vector3(...to);
  const dir = b.clone().sub(a);
  const len = dir.length() * on;
  const mid = a.clone().addScaledVector(dir.clone().normalize(), len / 2);
  const q = new THREE.Quaternion().setFromUnitVectors(Y, dir.clone().normalize());
  if (on <= 0.001) return null;
  const flicker = 1 + Math.sin(t * 40) * 0.06;
  return (
    <group>
      <mesh position={mid.toArray()} quaternion={q}>
        <cylinderGeometry args={[0.05 * flicker, 0.05 * flicker, len, 12]} />
        <meshBasicMaterial color={'#e9fff4'} />
      </mesh>
      <mesh position={mid.toArray()} quaternion={q}>
        <cylinderGeometry args={[0.2, 0.2, len, 16]} />
        <meshBasicMaterial color={theme.color.laser} transparent opacity={0.28} {...ADD} depthWrite={false} />
      </mesh>
      {[0.2, 0.45, 0.7, 0.95].map((k) => (
        <Glow key={k} position={a.clone().addScaledVector(dir, Math.min(k, on)).toArray() as Vec3} scale={1.6} color={theme.color.laser} opacity={0.4} />
      ))}
    </group>
  );
};

const NanoDiamonds: React.FC<{ t: number; amount: number; since: number }> = ({ t, amount, since }) => {
  const n = 90;
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => new THREE.IcosahedronGeometry(1, 0), []);
  const mat = useDiamondMaterial({ emissive: 0.5 });
  const data = useMemo(() => {
    const r = mulberry32(8);
    return Array.from({ length: n }, () => {
      const v = new THREE.Vector3(r() * 2 - 1, r() * 1.4 - 0.2, r() * 2 - 1).normalize();
      return { v, d: 0.3 + r() * 1.4, s: 0.03 + r() * 0.05, sp: r() * 6, delay: r() * 0.5 };
    });
  }, []);
  const pos = (i: number): Vec3 => {
    const d = data[i];
    const out = d.d * (0.4 + 0.6 * smooth(since * 0.5)) + since * 0.08;
    return [SAMPLE[0] + d.v.x * out, SAMPLE[1] + 0.1 + d.v.y * out, SAMPLE[2] + d.v.z * out];
  };
  useInstances(ref, n, (i, o) => {
    const d = data[i];
    const a = smooth((amount - d.delay) / 0.5);
    o.position.set(...pos(i));
    o.rotation.set(t * 2 + d.sp, t * 1.4 + d.sp, 0);
    o.scale.setScalar(Math.max(0.00001, d.s * a));
  });
  return (
    <>
      <instancedMesh ref={ref} args={[geo, mat, n]} frustumCulled={false} />
      <Sparkles points={Array.from({ length: 40 }, (_, k) => pos(k * 2))} t={t} size={40} intensity={amount} rate={2} />
    </>
  );
};

export const LabScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, isV, beat, length, width, height } = useScene();
  const t = frame / fps;

  const lights = ease(frame, [beat(1), beat(1) + 30], [0.25, 1], theme.ease.out);
  const beamOn = ease(frame, [beat(3) + 10, beat(3) + 40], [0, 1], theme.ease.out);
  const beamOff = 1 - ease(frame, [beat(4) + 30, beat(4) + 45], [0, 1], theme.ease.in);
  const hit = beat(4) + 6;
  const flash = Math.max(0, 1 - Math.abs(frame - hit) / 10) ** 1.5;
  const shock = ease(frame, [hit, hit + 40], [0, 1], theme.ease.out);
  const nano = ease(frame, [beat(5) - 10, beat(5) + 50], [0, 1], theme.ease.out);
  const since = Math.max(0, frame - (beat(5) - 10)) / fps;

  const k = [0, beat(2), beat(3), beat(4), beat(5) + 30, length];
  const dist = easeMulti(frame, k, isV ? [24, 19, 17, 12, 8, 13] : [17, 14, 13, 10, 8, 11]);
  const ang = 0.6 + t * 0.05;
  const pose: Pose = {
    pos: [Math.sin(ang) * dist, SAMPLE[1] + easeMulti(frame, k, [5, 3.4, 3, 1.8, 1.2, 2.2]), Math.cos(ang) * dist],
    target: [SAMPLE[0], SAMPLE[1] - 0.3, SAMPLE[2]],
    fov: isV ? 58 : 40,
    shift: isV ? 0.1 : 0,
  };
  const L1: Vec3 = [-7, 3.2, 1.6];
  const L2: Vec3 = [6.5, 3.6, -2.4];
  const W = (p: Vec3) => project(pose, width, height, p);
  const sL = W([SAMPLE[0], SAMPLE[1] + 1.6, SAMPLE[2]]);
  const lL = W([L1[0], L1[1] + 1.2, L1[2]]);

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `radial-gradient(70% 60% at 50% ${isV ? 40 : 45}%, rgba(20,60,80,${0.5 * lights}) 0%, rgba(2,6,14,1) 75%)`,
        }}
      />
      <SceneCanvas pose={pose} envIntensity={0.8}>
        <ambientLight intensity={0.15 * lights} />
        <spotLight position={[0, 12, 4]} angle={0.5} penumbra={0.8} intensity={170 * lights} color={'#cfeaff'} />
        <pointLight position={SAMPLE} intensity={400 * flash + 30 * nano} color={'#ffffff'} />
        <pointLight position={[0, 3, 0]} intensity={30 * beamOn * beamOff} color={theme.color.laser} />
        {/* floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
          <circleGeometry args={[14, 64]} />
          <meshStandardMaterial color={'#050a10'} metalness={0.5} roughness={0.5} />
        </mesh>
        <gridHelper args={[28, 28, '#1e4a5a', '#12303c']} position={[0, 0.01, 0]} />
        {/* chamber ring */}
        <mesh position={[0, 1.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[9, 0.12, 12, 128]} />
          <meshStandardMaterial color={'#6c8796'} metalness={0.9} roughness={0.25} emissive={theme.color.teal} emissiveIntensity={0.3 * lights} />
        </mesh>
        {/* sample holder + sample */}
        <mesh position={[0, 0.7, 0]}>
          <cylinderGeometry args={[0.06, 0.12, 1.4, 16]} />
          <meshStandardMaterial color={'#9aa9b4'} metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={SAMPLE} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.45, 0.45, 0.12, 32]} />
          <meshPhysicalMaterial color={'#e8eef5'} roughness={0.3} transmission={0} clearcoat={1} emissive={'#ffffff'} emissiveIntensity={flash * 3 + beamOn * beamOff * 0.4} />
        </mesh>
        {/* laser heads */}
        {[L1, L2].map((p, i) => {
          const dir = new THREE.Vector3(...SAMPLE).sub(new THREE.Vector3(...p)).normalize();
          const q = new THREE.Quaternion().setFromUnitVectors(Y, dir);
          return (
            <group key={i} position={p} quaternion={q}>
              <mesh position={[0, -0.9, 0]}>
                <boxGeometry args={[0.9, 2.2, 0.9]} />
                <meshStandardMaterial color={'#25313b'} metalness={0.8} roughness={0.3} />
              </mesh>
              <mesh position={[0, 0.25, 0]}>
                <cylinderGeometry args={[0.28, 0.32, 0.3, 24]} />
                <meshStandardMaterial color={'#0e1418'} emissive={theme.color.laser} emissiveIntensity={beamOn * beamOff * 2} />
              </mesh>
            </group>
          );
        })}
        <Beam from={L1} to={SAMPLE} on={beamOn * beamOff} t={t} />
        <Beam from={L2} to={SAMPLE} on={beamOn * beamOff} t={t} />
        <Glow position={SAMPLE} scale={2.4 * beamOn * beamOff + 14 * flash} color={flash > 0.05 ? '#ffffff' : theme.color.laser} opacity={0.9} />
        {/* shock wave */}
        {shock > 0 && shock < 1 ? (
          <mesh position={SAMPLE} rotation={[Math.PI / 2, 0, 0]} scale={0.3 + shock * 7}>
            <torusGeometry args={[1, 0.04, 8, 96]} />
            <meshBasicMaterial color={'#dffcff'} transparent opacity={(1 - shock) * 0.9} {...ADD} depthWrite={false} />
          </mesh>
        ) : null}
        <NanoDiamonds t={t} amount={nano} since={since} />
        <Glow position={SAMPLE} scale={4 * nano} color={theme.color.cyan} opacity={0.35 * nano} />
      </SceneCanvas>
      <AbsoluteFill style={{ background: '#ffffff', opacity: flash * 0.55, mixBlendMode: 'screen' }} />

      <Label anchor="above" x={width / 2} y={isV ? 360 : 170} from={6} to={beat(1) + 10} title="Is it really possible?" size={isV ? 56 : 52} />
      <Label anchor="above" x={width / 2} y={isV ? 360 : 170} from={beat(2) + 6} to={beat(3) + 4} title="Lab experiment" sub="recreating a planet's insides" />
      <Label anchor="above" x={lL.x} y={lL.y} from={beat(3) + 16} to={beat(4)} title="Powerful laser" color={theme.color.laser} size={isV ? 38 : 34} />
      <Label anchor="above" x={sL.x} y={sL.y} from={beat(3) + 26} to={beat(4)} title="Carbon-rich plastic" sub="the sample" size={isV ? 34 : 30} />
      <Label anchor="above" x={sL.x} y={sL.y} from={beat(5) + 10} to={length + 30} title="Tiny diamonds formed" sub="“nanodiamonds”, in a split second" color={theme.color.ice} />
    </AbsoluteFill>
  );
};
