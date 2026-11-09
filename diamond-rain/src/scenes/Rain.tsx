import React, { useMemo, useRef } from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import * as THREE from 'three';
import { SceneCanvas, SpaceBackdrop } from '../components/SceneCanvas';
import { SceneProvider, useScene } from '../components/SceneContext';
import { Label } from '../components/Label';
import { Inst, octaGeometry, Sparkles, Stars, useDiamondMaterial, useInstances } from '../three/parts';
import { CutawayPlanet, facePoint, OPEN_FACING, rotY } from '../three/Cutaway';
import { ease, easeMulti, mulberry32, smooth, windowIn } from '../lib/anim';
import { project, Pose, Vec3 } from '../three/camera';
import { theme } from '../theme';

/** Diamonds sinking from the mantle toward the core, inside the open wedge (local units, planet r = 1). */
const SinkingDiamonds: React.FC<{ t: number; count: number; density: number }> = ({ t, count, density }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(octaGeometry, []);
  const mat = useDiamondMaterial({ emissive: 0.45 });
  const data = useMemo(() => {
    const r = mulberry32(99);
    return Array.from({ length: count }, () => ({
      phi: Math.PI * (1.52 + r() * 0.46),
      th: Math.PI / 2 + (r() * 2 - 1) * 1.05,
      r0: r(),
      v: 0.025 + r() * 0.03,
      s: 0.011 + r() * 0.016,
      sp: r() * 4,
      gate: r(),
    }));
  }, [count]);
  const pos = (i: number): [Vec3, number] => {
    const d = data[i];
    const span = 0.74 - 0.33;
    const u = (((d.r0 + d.v * t) % 1) + 1) % 1; // 0 → 1 as it sinks
    const rad = 0.74 - u * span;
    const th = d.th + Math.sin(t * 0.6 + d.sp) * 0.04;
    return [
      [-Math.cos(d.phi) * Math.sin(th) * rad, Math.cos(th) * rad, Math.sin(d.phi) * Math.sin(th) * rad],
      Math.sin(Math.PI * u),
    ];
  };
  useInstances(ref, count, (i, o) => {
    const [p, life] = pos(i);
    const on = data[i].gate < density ? 1 : 0;
    o.position.set(...p);
    o.rotation.set(t * 1.3 + data[i].sp, t + data[i].sp, 0);
    o.scale.setScalar(Math.max(0.00001, data[i].s * life * on));
  });
  const glints = Array.from({ length: 70 }, (_, k) => pos((k * 13) % count)[0]);
  return (
    <>
      <instancedMesh ref={ref} args={[geo, mat, count]} frustumCulled={false} />
      <Sparkles points={glints} t={t} size={34} intensity={Math.min(1, density * 1.5)} rate={1.4} />
    </>
  );
};

/** Close-up "rain": water streaks that turn into diamonds. */
const RainCloseUp: React.FC<{ morph: number }> = ({ morph }) => {
  const frame = useCurrentFrame();
  const { fps, isV } = useScene();
  const t = frame / fps;
  const n = 700;
  const cyl = useMemo(() => new THREE.CylinderGeometry(0.025, 0.025, 1.4, 6), []);
  const octa = useMemo(octaGeometry, []);
  const dmat = useDiamondMaterial({ emissive: 0.3 });
  const data = useMemo(() => {
    const r = mulberry32(5);
    return Array.from({ length: n }, () => ({
      x: (r() * 2 - 1) * (isV ? 14 : 24),
      y: r(),
      z: -r() * 30,
      v: 0.5 + r() * 0.4,
      s: 0.12 + r() * 0.16,
      rx: r() * 6,
    }));
  }, [isV]);
  const H = 34;
  const p = (i: number): Vec3 => {
    const d = data[i];
    const y = 17 - ((((d.y + d.v * t * (1 - 0.45 * morph)) % 1) + 1) % 1) * H;
    return [d.x, y, d.z];
  };
  const m = smooth(morph);
  const writeS = (i: number, o: THREE.Object3D) => {
    o.position.set(...p(i));
    o.scale.set(1, Math.max(0.0001, 1 - m), 1);
  };
  const writeD = (i: number, o: THREE.Object3D) => {
    o.position.set(...p(i));
    o.rotation.set(data[i].rx + t * 2, t * 1.5 + data[i].rx, 0);
    o.scale.setScalar(Math.max(0.0001, data[i].s * m));
  };
  const pose: Pose = { pos: [0, 0, 16], target: [0, -1, -10], fov: isV ? 60 : 44, shift: 0 };
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, #041a33 0%, #072b40 55%, #020812 100%)' }} />
      <SceneCanvas pose={pose}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[4, 10, 8]} intensity={2.4} />
        <fog attach="fog" args={['#041a33', 14, 46]} />
        <Inst count={n} geometry={cyl} write={writeS}>
          <meshStandardMaterial color={'#9fd8ff'} emissive={'#4aa8ff'} emissiveIntensity={0.6} transparent opacity={0.6} />
        </Inst>
        <Inst count={n} geometry={octa} material={dmat} write={writeD} />
        <Sparkles points={Array.from({ length: 90 }, (_, k) => p((k * 7) % n))} t={t} size={44} intensity={m} rate={1.5} />
      </SceneCanvas>
    </AbsoluteFill>
  );
};

export const RainScene: React.FC = () => {
  const frame = useCurrentFrame();
  const scene = useScene();
  const { fps, isV, beat, length, width, height } = scene;
  const t = frame / fps;
  const R = isV ? 4.4 : 5;
  const rot = OPEN_FACING + 0.35 + Math.sin(t * 0.12) * 0.12;

  // Close-up rain segment covers lines 5–6.
  const closeA = beat(5) - 8;
  const closeB = beat(7) + 4;
  const close = windowIn(frame, closeA, closeB, 16, 16);
  const morph = ease(frame, [beat(6), beat(6) + 1.6 * fps], [0, 1], theme.ease.inOut);
  const density = easeMulti(frame, [0, beat(1), beat(7), beat(8), length], [0.15, 0.35, 0.55, 1, 1]);

  const k = [0, beat(2), beat(5), beat(7), beat(8), length];
  const camZ = easeMulti(frame, k, isV ? [27, 22, 21, 23, 25, 28] : [22, 17, 16, 18, 20, 23]);
  const pose: Pose = {
    pos: [easeMulti(frame, k, isV ? [-1.5, -0.6, -0.6, 0, 0.8, 0] : [-3, -1.6, -1.6, 0, 1.5, 0]) + Math.sin(t * 0.2) * 0.5, 2.2, camZ],
    target: [easeMulti(frame, k, isV ? [0, -0.5, -0.5, -0.3, 0, 0] : [0, -1.2, -1.2, -0.8, 0, 0]), easeMulti(frame, k, [0, -0.4, -0.4, -0.3, 0, 0]), 0],
    fov: isV ? 60 : 40,
  };
  const P = (p: Vec3) => project(pose, width, height, rotY(p, rot, R, [0, 0, 0]));
  const mantleL = P(facePoint(0.62, 0.4));
  const coreL = project(pose, width, height, [0, -R * 0.42, 0]);
  const top = project(pose, width, height, [0, R * 1.12, 0]);

  // Sub-scene timing for the close-up (its own lines are not needed).
  const sub = { lines: [], length: closeB - closeA };

  return (
    <AbsoluteFill>
      <SpaceBackdrop drift={t / 25} />
      <SceneCanvas pose={pose}>
        <ambientLight intensity={0.08} />
        <directionalLight position={[-16, 8, 8]} intensity={3.4} />
        <Stars count={2000} radius={900} seed={14} />
        <CutawayPlanet radius={R} rotation={rot} heat={0.75} tilt={0.12}>
          <SinkingDiamonds t={t} count={650} density={density} />
        </CutawayPlanet>
      </SceneCanvas>

      <Label anchor="above" x={top.x} y={top.y} from={beat(1) + 6} to={beat(2)} title="Tiny diamonds" sub="forming deep in the mantle" color={theme.color.ice} />
      <Label anchor="above" x={top.x} y={top.y} from={beat(2) + 6} to={beat(5) - 10} title="Heavier → they sink" sub="denser than the fluid around them" />
      <Label x={mantleL.x} y={mantleL.y} from={beat(3)} to={beat(5) - 10} title="↓" size={isV ? 80 : 72} color={theme.color.cyan} />
      <Label anchor="below" x={coreL.x} y={coreL.y + 20} from={beat(7) + 20} to={length + 30} title="Toward the core" size={isV ? 36 : 32} color={theme.color.core} />
      <Label anchor="above" x={top.x} y={top.y} from={beat(8) + 6} to={length + 30} title="A hidden diamond storm" color={theme.color.ice} />

      {close > 0.001 ? (
        <AbsoluteFill style={{ opacity: close }}>
          {/* rendered as its own little scene, local frame starts at closeA */}
          <SubScene from={closeA} value={sub}>
            <RainCloseUp morph={morph} />
          </SubScene>
          <Label anchor="above" x={width / 2} y={isV ? 330 : 170} from={beat(5)} to={beat(6)} title="Rain…" />
          <Label anchor="above" x={width / 2} y={isV ? 330 : 170} from={beat(6) + 8} to={closeB} title="…made of diamonds" color={theme.color.ice} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

const SubScene: React.FC<{ from: number; value: { lines: never[]; length: number }; children: React.ReactNode }> = ({
  from,
  value,
  children,
}) => (
  <Sequence from={from} durationInFrames={value.length} layout="none">
    <SceneProvider value={value}>{children}</SceneProvider>
  </Sequence>
);
