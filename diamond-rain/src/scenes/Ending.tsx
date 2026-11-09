import React, { useMemo, useRef } from 'react';
import { AbsoluteFill, spring, useCurrentFrame } from 'remotion';
import * as THREE from 'three';
import { SceneCanvas, SpaceBackdrop } from '../components/SceneCanvas';
import { useScene } from '../components/SceneContext';
import { Label } from '../components/Label';
import { ADD, Glow, Planet, Sparkles, Stars, useInstances } from '../three/parts';
import { stormTexture } from '../three/textures';
import { ease, easeMulti, mulberry32 } from '../lib/anim';
import { project, Pose, Vec3 } from '../three/camera';
import { theme } from '../theme';

const R = 6;
/** Direction of the dark-spot area on the planet texture (u=0.32, v=0.62). */
const SPOT = new THREE.Vector3(0.4, -0.37, 0.84).normalize();

const Winds: React.FC<{ t: number; amount: number }> = ({ t, amount }) => {
  const n = 80;
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => new THREE.TorusGeometry(R * 1.035, 0.025, 4, 32, 0.5), []);
  const data = useMemo(() => {
    const r = mulberry32(17);
    return Array.from({ length: n }, () => ({ lat: (r() * 2 - 1) * 1.1, ph: r() * 6.28, w: 1.2 + r() * 1.4 }));
  }, []);
  useInstances(ref, n, (i, o) => {
    const d = data[i];
    const c = Math.cos(d.lat);
    o.position.set(0, R * 1.035 * Math.sin(d.lat), 0);
    o.rotation.set(Math.PI / 2, 0, d.ph + t * d.w);
    o.scale.set(c, c, 1).multiplyScalar(Math.max(0.0001, amount));
  });
  return (
    <instancedMesh ref={ref} args={[geo, undefined, n]} frustumCulled={false}>
      <meshBasicMaterial color={'#dff4ff'} transparent opacity={0.5 * amount} {...ADD} depthWrite={false} />
    </instancedMesh>
  );
};

export const EndingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, isV, beat, length, width, height } = useScene();
  const t = frame / fps;

  const spin = 0.35 + t * 0.03;
  const spotWorld = SPOT.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), spin);
  const storm = ease(frame, [beat(1), beat(1) + 30], [0, 1], theme.ease.out);
  const winds = ease(frame, [beat(2), beat(2) + 20], [0, 1], theme.ease.out) * (1 - ease(frame, [beat(4), beat(4) + 30], [0, 1]));
  const rain = ease(frame, [beat(3), beat(3) + 30], [0, 1], theme.ease.out) * (1 - ease(frame, [beat(4), beat(4) + 40], [0, 1]));

  // Camera: fly in through stars → storm close-up → wide → zoom far out.
  const spotCam = spotWorld.clone().multiplyScalar(R * 2.3).add(new THREE.Vector3(0, 1.2, 0));
  const k = [0, beat(1), beat(2), beat(3), beat(4), beat(5), length];
  const pts = [
    [0, 4, 220],
    [spotCam.x, spotCam.y, spotCam.z],
    [6, 3, isV ? 24 : 19],
    [0, 1, isV ? 27 : 22],
    [0, 4, 70],
    [0, 20, 520],
    [0, 26, 640],
  ];
  const ax = (j: number) => easeMulti(frame, k, pts.map((q) => q[j]), theme.ease.inOut);
  const tgtMix = easeMulti(frame, k, [0, 1, 0, 0, 0, 0, 0]);
  const spotSurf = spotWorld.clone().multiplyScalar(R);
  const pose: Pose = {
    pos: [ax(0), ax(1), ax(2)],
    target: [spotSurf.x * tgtMix * 0.9, spotSurf.y * tgtMix * 0.9 - 0.4 + easeMulti(frame, [beat(4), beat(5), length], [0, 60, 90]), spotSurf.z * tgtMix * 0.6],
    fov: isV ? 60 : 42,
  };

  // Storm vortex disc placed on the surface, facing outward.
  const stormQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), SPOT);
  const rainPts = useMemo(() => {
    const r = mulberry32(61);
    return Array.from({ length: 50 }, () => [(r() * 2 - 1) * R * 0.6, r(), (r() * 2 - 1) * 0.3] as Vec3);
  }, []);
  const glints = rainPts.map((g, i): Vec3 => {
    const y = R * 0.6 - ((g[1] * R * 1.2 + t * (0.8 + (i % 4) * 0.2)) % (R * 1.2));
    return [g[0], y, R * 0.9];
  });

  const endIn = (i: number) => spring({ frame: frame - beat(5) - i * 6, fps, config: theme.spring.soft, durationInFrames: 45 });
  const words = ['This', 'is', 'only', 'the', 'beginning.'];
  const fadeOut = ease(frame, [length - 20, length - 2], [1, 0], theme.ease.in);
  const W = (q: Vec3) => project(pose, width, height, q);
  const spotL = W(spotWorld.clone().multiplyScalar(R * 1.25).toArray() as Vec3);
  const topL = W([0, R * 1.3, 0]);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <SpaceBackdrop drift={t / 20} />
      <SceneCanvas pose={pose}>
        <ambientLight intensity={0.04} />
        <directionalLight position={[-40, 10, 6]} intensity={4} />
        <Stars count={4000} radius={1500} depth={0.95} seed={71} size={isV ? 5 : 4.5} />
        <Stars count={1500} radius={260} depth={0.7} seed={72} size={4} opacity={0.8} />
        <group>
          <Planet kind="neptune" radius={R} spin={spin} />
          <mesh position={SPOT.clone().multiplyScalar(R * 1.004).applyAxisAngle(new THREE.Vector3(0, 1, 0), spin).toArray()} quaternion={new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), spin).multiply(stormQuat)}>
            <group rotation={[0, 0, -t * 0.6]}>
              <mesh>
                <circleGeometry args={[R * 0.32, 64]} />
                <meshBasicMaterial map={stormTexture()} transparent opacity={0.25 + 0.75 * storm} depthWrite={false} />
              </mesh>
            </group>
          </mesh>
          <Winds t={t} amount={winds} />
        </group>
        <Planet kind="uranus" radius={4.5} position={[-60, 12, -160]} tilt={1.7} spin={t * 0.04} rings />
        <Glow position={[-900, 200, -1800]} scale={600} color={'#ffe6b0'} opacity={0.5} />
        <Sparkles points={glints} t={t} size={40} intensity={rain} rate={1.6} />
      </SceneCanvas>
      <Label anchor="above" x={spotL.x} y={spotL.y} from={beat(1) + 20} to={beat(2)} title="Storms as wide as Earth" sub="Neptune's Great Dark Spot" />
      <Label anchor="above" x={topL.x} y={topL.y} from={beat(2) + 10} to={beat(3)} title="Winds ≈ 2,000 km/h" sub="faster than the speed of sound" color={theme.color.ice} />
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          paddingLeft: isV ? 70 : 160,
          paddingRight: isV ? 150 : 160,
          paddingBottom: isV ? 420 : 60,
        }}
      >
        <div
          style={{
            fontFamily: theme.font.display,
            fontWeight: 700,
            fontSize: isV ? 104 : 110,
            lineHeight: 1.12,
            textAlign: 'center',
            color: theme.color.text,
            textShadow: '0 0 34px rgba(95,244,255,0.55), 0 0 90px rgba(31,181,184,0.35), 0 4px 20px rgba(0,0,0,0.9)',
          }}
        >
          {words.map((w, i) => {
            const q = endIn(i);
            return (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  marginRight: i < words.length - 1 ? '0.26em' : 0,
                  opacity: q,
                  transform: `translateY(${(1 - q) * 40}px) scale(${0.92 + 0.08 * q})`,
                  color: w.startsWith('beginning') ? theme.color.ice : undefined,
                }}
              >
                {w}
              </span>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
