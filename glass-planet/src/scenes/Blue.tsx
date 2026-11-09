import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import * as THREE from 'three';
import { SceneCanvas, SpaceBackdrop } from '../components/SceneCanvas';
import { useScene } from '../components/SceneContext';
import { Tag } from '../components/Text';
import { Host } from '../components/Host';
import { Inst, PlanetBody, Sparkles, Stars, useDiamondMaterial } from '../three/parts';
import { ease, mulberry32 } from '../lib/anim';
import { project, Pose, Vec3 } from '../three/camera';
import { theme } from '../theme';
import { fovFor, hostSpot } from './layout';

/** Glittering silica particles drifting in blue haze (inside the clouds). */
const Silica: React.FC<{ t: number }> = ({ t }) => {
  const N = 900;
  const geo = useMemo(() => new THREE.IcosahedronGeometry(1, 0), []);
  const mat = useDiamondMaterial({ emissive: 0.4 });
  const d = useMemo(() => {
    const r = mulberry32(7);
    return Array.from({ length: N }, () => [r() * 2 - 1, r() * 2 - 1, -r() * 30, 0.02 + r() * 0.06, r() * 6] as const);
  }, []);
  const p = (i: number): Vec3 => [d[i][0] * 14 + Math.sin(t * 0.4 + d[i][4]) * 0.6, d[i][1] * 18 - t * 0.25, d[i][2] + t * 1.2];
  return (
    <>
      <fog attach="fog" args={['#0d2f9a', 6, 34]} />
      <Inst count={N} geometry={geo} material={mat} write={(i, o) => {
        o.position.set(...p(i));
        o.rotation.set(t + d[i][4], t * 1.3, 0);
        o.scale.setScalar(d[i][3] * 2.2);
      }} />
      <Sparkles points={Array.from({ length: 140 }, (_, k) => p(k * 6))} t={t} size={44} rate={1.6} />
    </>
  );
};

/** 7 · Deep blue like Earth — but the blue may be glass in its clouds. */
export const BlueScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, isV, at, length, width, height } = useScene();
  const t = frame / fps;
  const aOceans = at('it has no oceans', 3.8);
  const aGlass = at('tiny bits of glass', 8);
  const aSilica = at('glass is made from silica', 11.3);
  const zoom = ease(frame, [aGlass - 50, aGlass + 6], [0, 1], theme.ease.in);
  const inside = ease(frame, [aGlass - 10, aGlass + 8], [0, 1], theme.ease.inOut);
  const earthOut = ease(frame, [aOceans + 10, aOceans + 40], [0, 1], theme.ease.in);
  const HD: Vec3 = isV ? [0, 2.4, 0] : [-3.2, 0, 0];
  const EA: Vec3 = isV ? [0.4, -2.6, 0] : [3.6, 0, 0];
  const pose: Pose = {
    pos: [HD[0] * zoom + Math.sin(t * 0.2) * 0.5, HD[1] * zoom + 0.6, (isV ? 21 : 14) - zoom * (isV ? 17 : 11.5)],
    target: [HD[0] * zoom, HD[1] * zoom, 0],
    fov: fovFor(isV, 40),
  };
  const W = (p: Vec3) => project(pose, width, height, p);
  const hdL = W([HD[0], HD[1] + 2.3, 0]);
  const eaL = W([EA[0], EA[1] + 1.4, 0]);
  const host = hostSpot(isV, isV ? 'left' : 'right');
  return (
    <AbsoluteFill>
      <SpaceBackdrop drift={t / 25} />
      <AbsoluteFill style={{ opacity: 1 - inside }}>
        <SceneCanvas pose={pose}>
          <ambientLight intensity={0.05} />
          <Stars count={2400} radius={600} seed={71} />
          <PlanetBody kind="hd" radius={2} position={HD} t={t} sunDir={[0.8, 0.4, 0.6]} heat={0.25} ambient={0.03} />
          <PlanetBody kind="earth" radius={1.0} position={[EA[0] + earthOut * 12, EA[1], EA[2]]} t={t} sunDir={[-0.6, 0.4, 0.7]} ambient={0.06} opacity={1} />
        </SceneCanvas>
      </AbsoluteFill>
      {inside > 0 ? (
        <AbsoluteFill style={{ opacity: inside, background: 'radial-gradient(ellipse at 50% 40%, #2a64e8 0%, #0d2f9a 55%, #04123f 100%)' }}>
          <SceneCanvas pose={{ pos: [0, 0, 6], target: [0, 0, -10], fov: fovFor(isV, 50), shift: 0 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[3, 5, 4]} intensity={2.2} />
            <Silica t={t} />
          </SceneCanvas>
        </AbsoluteFill>
      ) : null}
      <Tag text="HD 189733 b" from={10} to={aGlass - 40} x={hdL.x} y={hdL.y} color={theme.color.cobaltGlow} size={30} />
      <Tag text="Earth" from={16} to={aOceans + 16} x={eaL.x} y={eaL.y} color={theme.color.sky} size={30} />
      <Tag text="No oceans" from={aOceans + 6} to={aGlass - 40} x={isV ? 490 : width / 2} y={isV ? 330 : 140} color={theme.color.pink} />
      <Tag text="Tiny bits of glass" from={aGlass + 10} to={aSilica} x={isV ? 490 : width / 2} y={isV ? 330 : 140} color={theme.color.glass} size={isV ? 44 : 44} />
      <Tag text={<span>SiO<sub style={{ fontSize: '0.6em' }}>2</sub> · silica, like sand</span>} from={aSilica + 6} to={length} x={isV ? 490 : width / 2} y={isV ? 330 : 140} color={theme.color.butter} size={isV ? 44 : 44} />
      <Host
        x={host.x}
        y={host.y + Math.sin(t * 1.4) * 10}
        height={host.height}
        pose="astronaut"
        poseAt={aGlass}
        rotate={Math.sin(t) * 4}
        bubbles={[
          { expr: 'confused', from: aOceans + 4, hold: 2 },
          { expr: 'surprised', from: aGlass + 8, hold: 2 },
        ]}
        fx={[
          { type: 'question', from: aOceans + 4, to: aOceans + 64 },
          { type: 'sparkle', from: aGlass + 8, to: length },
        ]}
        bubbleSide={isV ? 'right' : 'left'}
      />
    </AbsoluteFill>
  );
};
