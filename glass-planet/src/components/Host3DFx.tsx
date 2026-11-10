import React from 'react';
import { project, Pose, Vec3 } from '../three/camera';
import { Bubble, Fx, headPoint, HostFx, ReactionBubble } from './Host';
import { useScene } from './SceneContext';

/** Screen-space head position of a 3D (billboard) host, for bubbles and effects. */
export const useHostHead = (pose: Pose, feet: Vec3, height: number, sitting = false, up: Vec3 = [0, 1, 0]) => {
  const { width, height: H } = useScene();
  const a = project(pose, width, H, feet);
  const b = project(pose, width, H, [feet[0] + up[0] * height, feet[1] + up[1] * height, feet[2] + up[2] * height]);
  const px = Math.hypot(b.x - a.x, b.y - a.y); // on-screen figure height
  // same sprite metrics as the 2D host (head centre / size per pose)
  const hp = headPoint(0, 0, px, sitting ? 'astronaut_sit' : 'astronaut');
  const k = -hp.y / px;
  return { x: a.x + (b.x - a.x) * k + hp.x, y: a.y + (b.y - a.y) * k, size: hp.size, px };
};

export const Host3DOverlay: React.FC<{
  pose: Pose;
  feet: Vec3;
  height: number;
  bubbles?: Bubble[];
  fx?: Fx[];
  side?: 'left' | 'right';
  sitting?: boolean;
  flip?: boolean;
  up?: Vec3;
}> = ({ pose, feet, height, bubbles = [], fx = [], side = 'right', sitting, flip, up }) => {
  const h = useHostHead(pose, feet, height, sitting, up);
  const dir = side === 'right' ? 1 : -1;
  return (
    <>
      <HostFx hx={h.x} hy={h.y} size={h.size} fx={fx} flip={flip} />
      <ReactionBubble x={h.x + dir * h.size * 0.95} y={h.y - h.size * 0.75} size={Math.max(110, h.size * 0.95)} bubbles={bubbles} side={side} />
    </>
  );
};
