import React, { useLayoutEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

export type Vec3 = [number, number, number];
export type Pose = {
  pos: Vec3;
  target: Vec3;
  fov: number;
  roll?: number;
  /**
   * Moves the optical centre up by this fraction of the frame height.
   * Defaults to 0.12 on vertical frames, so 3D subjects sit above the
   * caption band and clear of TikTok's bottom UI.
   */
  shift?: number;
};
export const VERTICAL_SHIFT = 0.12;

const applyPose = (cam: THREE.PerspectiveCamera, pose: Pose) => {
  cam.position.set(...pose.pos);
  const r = pose.roll ?? 0;
  cam.up.set(Math.sin(r), Math.cos(r), 0);
  cam.fov = pose.fov;
  cam.near = 0.05;
  cam.far = 6000;
  cam.lookAt(...pose.target);
  const shift = pose.shift ?? (cam.aspect < 1 ? VERTICAL_SHIFT : 0);
  if (shift) cam.setViewOffset(cam.aspect * 1000, 1000, 0, shift * 1000, cam.aspect * 1000, 1000);
  else cam.clearViewOffset();
  cam.updateProjectionMatrix();
  cam.updateMatrixWorld(true);
};

/** Drives the R3F camera from a pose computed with useCurrentFrame() (no useFrame). */
export const CameraRig: React.FC<{ pose: Pose }> = ({ pose }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => {
    applyPose(camera, pose);
  });
  return null;
};

const scratchCam = new THREE.PerspectiveCamera();
const v = new THREE.Vector3();

/**
 * Project a world-space point to pixel coordinates using the same pose as the
 * 3D camera, so HTML labels stick to 3D objects deterministically.
 */
export const project = (pose: Pose, width: number, height: number, p: Vec3) => {
  scratchCam.aspect = width / height;
  applyPose(scratchCam, pose);
  v.set(...p).project(scratchCam);
  return { x: ((v.x + 1) / 2) * width, y: ((1 - v.y) / 2) * height, behind: v.z > 1 };
};

export const mix3 = (a: Vec3, b: Vec3, t: number): Vec3 => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];
