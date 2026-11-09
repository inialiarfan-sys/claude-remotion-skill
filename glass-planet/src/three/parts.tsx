import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { mulberry32 } from '../lib/anim';
import { cobaltTexture, earthTexture, glowTexture, jupiterTexture, sparkleTexture, starTexture } from './textures';
import { theme } from '../theme';
import type { Vec3 } from './camera';

/**
 * Additive "light" blending that leaves the canvas alpha untouched. The canvas is
 * transparent over a CSS backdrop, and plain AdditiveBlending would also write
 * alpha, punching dark holes where a glow is faint.
 */
export const ADD = {
  blending: THREE.CustomBlending,
  blendEquation: THREE.AddEquation,
  blendSrc: THREE.SrcAlphaFactor,
  blendDst: THREE.OneFactor,
  blendSrcAlpha: THREE.ZeroFactor,
  blendDstAlpha: THREE.OneFactor,
} as const;

/** Studio-style environment map so the diamonds have something to reflect. */
export const Environment: React.FC<{ intensity?: number }> = ({ intensity = 1 }) => {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const env = useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const tex = pm.fromScene(new RoomEnvironment(), 0.03).texture;
    pm.dispose();
    return tex;
  }, [gl]);
  useLayoutEffect(() => {
    scene.environment = env;
    scene.environmentIntensity = intensity;
  });
  return null;
};

/** Brilliant-cut gem silhouette (crown + pavilion) as a lathe. */
export const brilliantGeometry = () => {
  const pts = [
    new THREE.Vector2(0, -1.05),
    new THREE.Vector2(1, 0),
    new THREE.Vector2(0.98, 0.08),
    new THREE.Vector2(0.62, 0.42),
    new THREE.Vector2(0.0001, 0.42),
  ];
  const g = new THREE.LatheGeometry(pts, 16);
  return g.toNonIndexed();
};

export const octaGeometry = () => {
  const g = new THREE.OctahedronGeometry(1, 0);
  g.scale(0.8, 1.15, 0.8);
  return g;
};

/** Shiny, refractive-looking diamond material (clearcoat + iridescence + env reflections). */
export const useDiamondMaterial = (opts: { emissive?: number; opacity?: number; tint?: string } = {}) => {
  const { emissive = 0.08, opacity = 1, tint = theme.color.glass } = opts;
  return useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({
      color: tint,
      metalness: 0.75,
      roughness: 0.03,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      iridescence: 0.7,
      iridescenceIOR: 1.8,
      iridescenceThicknessRange: [200, 600],
      ior: 2.42,
      reflectivity: 1,
      specularIntensity: 1,
      specularColor: new THREE.Color('#ffffff'),
      envMapIntensity: 3.2,
      flatShading: true,
      emissive: new THREE.Color(theme.color.cyan),
      emissiveIntensity: emissive,
      transparent: opacity < 1,
      opacity,
    });
    return m;
  }, [emissive, opacity, tint]);
};

/** Background star field (Points with a soft round sprite). */
export const Stars: React.FC<{
  count?: number;
  radius?: number;
  size?: number;
  opacity?: number;
  seed?: number;
  depth?: number;
}> = ({ count = 2500, radius = 900, size = 5, opacity = 1, seed = 1, depth = 0.6 }) => {
  const geo = useMemo(() => {
    const rnd = mulberry32(seed);
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const u = rnd() * 2 - 1;
      const th = rnd() * Math.PI * 2;
      const r = radius * (1 - depth * rnd());
      const s = Math.sqrt(1 - u * u);
      pos.set([r * s * Math.cos(th), r * u, r * s * Math.sin(th)], i * 3);
      const k = rnd();
      c.set(k > 0.85 ? '#ffd9b0' : k > 0.6 ? '#bfe8ff' : '#ffffff').multiplyScalar(0.45 + rnd() ** 3 * 1.4);
      col.set([c.r, c.g, c.b], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return g;
  }, [count, radius, seed, depth]);
  return (
    <points geometry={geo} frustumCulled={false}>
      <pointsMaterial
        size={size}
        sizeAttenuation={false}
        map={glowTexture()}
        vertexColors
        transparent
        opacity={opacity}
        depthWrite={false}
        {...ADD}
      />
    </points>
  );
};

/** Additive glow sprite — our "bloom". */
export const Glow: React.FC<{
  position?: Vec3;
  scale: number;
  color?: string;
  opacity?: number;
  sparkle?: boolean;
  rotation?: number;
}> = ({ position = [0, 0, 0], scale, color = theme.color.cyan, opacity = 1, sparkle, rotation = 0 }) => (
  <sprite position={position} scale={[scale, scale, scale]} renderOrder={10}>
    <spriteMaterial
      map={sparkle ? sparkleTexture() : glowTexture()}
      color={color}
      transparent
      opacity={opacity}
      depthWrite={false}
      depthTest={!sparkle}
      {...ADD}
      rotation={rotation}
    />
  </sprite>
);

/** Fresnel rim atmosphere shell. */
const atmoVert = /* glsl */ `
varying vec3 vN; varying vec3 vV;
void main(){
  vec4 mv = modelViewMatrix * vec4(position,1.0);
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;
const atmoFrag = /* glsl */ `
uniform vec3 uColor; uniform float uPower; uniform float uIntensity;
varying vec3 vN; varying vec3 vV;
void main(){
  float f = pow(1.0 - abs(dot(vN, vV)), uPower);
  gl_FragColor = vec4(uColor * f * uIntensity, f * uIntensity);
}`;

export const Atmosphere: React.FC<{ radius: number; color: string; intensity?: number; power?: number }> = ({
  radius,
  color,
  intensity = 1.2,
  power = 2.6,
}) => {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: atmoVert,
        fragmentShader: atmoFrag,
        uniforms: {
          uColor: { value: new THREE.Color(color) },
          uPower: { value: power },
          uIntensity: { value: intensity },
        },
        transparent: true,
        depthWrite: false,
        ...ADD,
        side: THREE.FrontSide,
      }),
    [color, power, intensity],
  );
  mat.fog = false;
  return (
    <mesh scale={radius * 1.04} material={mat}>
      <sphereGeometry args={[1, 64, 48]} />
    </mesh>
  );
};

/** Helper: imperatively set instance matrices before R3F renders this frame. */
export const useInstances = (
  ref: React.RefObject<THREE.InstancedMesh>,
  count: number,
  write: (i: number, o: THREE.Object3D) => void,
) => {
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    for (let i = 0; i < count; i++) {
      dummy.position.set(0, 0, 0);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      write(i, dummy);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });
};

export const useRef3 = <T,>() => useRef<T>(null);

/**
 * Twinkling star-glints (Points with a 4-point sparkle sprite).
 * Brightness per point is a deterministic function of t.
 */
export const Sparkles: React.FC<{
  points: Vec3[];
  t: number;
  size?: number;
  color?: string;
  intensity?: number;
  rate?: number;
}> = ({ points, t, size = 40, color = '#e8fdff', intensity = 1, rate = 1 }) => {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(points.length * 3), 3));
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(points.length * 3), 3));
    return g;
  }, [points.length]);
  const base = useMemo(() => new THREE.Color(color), [color]);
  useLayoutEffect(() => {
    const pos = geo.getAttribute('position') as THREE.BufferAttribute;
    const col = geo.getAttribute('color') as THREE.BufferAttribute;
    for (let i = 0; i < points.length; i++) {
      pos.setXYZ(i, points[i][0], points[i][1], points[i][2]);
      const ph = (i * 2.399) % (Math.PI * 2);
      const w = 0.7 + ((i * 0.618) % 1) * 1.6;
      const b = Math.pow(Math.max(0, Math.sin(t * w * rate + ph)), 10) * intensity;
      col.setXYZ(i, base.r * b, base.g * b, base.b * b);
    }
    pos.needsUpdate = true;
    col.needsUpdate = true;
  });
  return (
    <points geometry={geo} frustumCulled={false} renderOrder={20}>
      <pointsMaterial
        size={size}
        sizeAttenuation={false}
        map={sparkleTexture()}
        vertexColors
        transparent
        depthWrite={false}
        depthTest={false}
        {...ADD}
      />
    </points>
  );
};

/**
 * InstancedMesh whose matrices are written from a callback. Must be rendered
 * inside the canvas so the write happens in the R3F tree, before the frame is
 * advanced (also on the very first frame of a still render).
 */
export const Inst: React.FC<{
  count: number;
  geometry: THREE.BufferGeometry;
  material?: THREE.Material;
  write: (i: number, o: THREE.Object3D) => void;
  colors?: THREE.Color[];
  children?: React.ReactNode;
}> = ({ count, geometry, material, write, colors, children }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  useInstances(ref, count, write);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m || !colors) return;
    for (let i = 0; i < count; i++) m.setColorAt(i, colors[i % colors.length]);
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [colors, count]);
  return (
    <instancedMesh ref={ref} args={[geometry, material, count]} frustumCulled={false}>
      {children}
    </instancedMesh>
  );
};

// ------------------------------------------------------------------ planets
const planetVert = /* glsl */ `
varying vec2 vUv; varying vec3 vN;
void main(){
  vUv = uv;
  vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position,1.0);
}`;
const planetFrag = /* glsl */ `
uniform sampler2D map; uniform float time; uniform vec3 sunDir; uniform float heat;
uniform float swirl; uniform float ambient; uniform float opacity;
varying vec2 vUv; varying vec3 vN;
void main(){
  float lat = vUv.y;
  // differential rotation: every latitude band drifts at its own speed → swirling bands
  float shift = time * (0.006 + 0.012 * sin(lat * 18.0) + 0.006 * sin(lat * 41.0)) * swirl;
  vec2 uv = vec2(vUv.x + shift, lat);
  uv.y += 0.006 * sin(uv.x * 40.0 + time * 0.4) * swirl;
  uv.x += 0.004 * sin(uv.y * 60.0 - time * 0.3) * swirl;
  vec3 col = texture2D(map, uv).rgb;
  float d = dot(normalize(vN), normalize(sunDir));
  float light = smoothstep(-0.18, 0.55, d);
  vec3 c = col * (ambient + 1.25 * light);
  // glowing hot dayside: sub-stellar hot spot
  float hot = pow(max(d, 0.0), 3.0) * heat;
  c += vec3(1.0, 0.42, 0.12) * hot * 0.55 + vec3(1.0, 0.75, 0.4) * pow(max(d, 0.0), 12.0) * heat * 0.4;
  gl_FragColor = vec4(c, opacity);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

/**
 * Generic planet: banded texture with per-latitude swirl, lit from `sunDir`
 * (world space), fresnel atmosphere, optional glowing dayside.
 */
export const PlanetBody: React.FC<{
  kind: 'hd' | 'earth' | 'jupiter';
  radius: number;
  position?: Vec3;
  rotation?: Vec3;
  t: number;
  sunDir?: Vec3;
  heat?: number;
  ambient?: number;
  atmo?: string;
  atmoIntensity?: number;
  opacity?: number;
}> = ({ kind, radius, position = [0, 0, 0], rotation = [0, 0, 0], t, sunDir = [1, 0.2, 0.6], heat = 0, ambient = 0.05, atmo, atmoIntensity = 1.3, opacity = 1 }) => {
  const map = kind === 'hd' ? cobaltTexture() : kind === 'earth' ? earthTexture() : jupiterTexture();
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: planetVert,
        fragmentShader: planetFrag,
        uniforms: {
          map: { value: map },
          time: { value: 0 },
          sunDir: { value: new THREE.Vector3() },
          heat: { value: 0 },
          swirl: { value: kind === 'earth' ? 0.2 : 1 },
          ambient: { value: ambient },
          opacity: { value: 1 },
        },
        transparent: opacity < 1,
      }),
    [map, kind],
  );
  mat.uniforms.time.value = t;
  mat.uniforms.sunDir.value.set(...sunDir);
  mat.uniforms.heat.value = heat;
  mat.uniforms.ambient.value = ambient;
  mat.uniforms.opacity.value = opacity;
  mat.transparent = opacity < 1;
  const a = atmo ?? (kind === 'hd' ? '#5f8dff' : kind === 'earth' ? '#8cc4ff' : '#f3d9b8');
  return (
    <group position={position} rotation={rotation}>
      <mesh scale={radius} material={mat}>
        <sphereGeometry args={[1, 96, 64]} />
      </mesh>
      <Atmosphere radius={radius} color={a} intensity={atmoIntensity * opacity} />
    </group>
  );
};

/** Orange-white star: granulated surface + layered glow + corona sparkle. */
export const Star: React.FC<{ radius: number; position?: Vec3; t: number; intensity?: number }> = ({ radius, position = [0, 0, 0], t, intensity = 1 }) => {
  const tex = starTexture();
  return (
    <group position={position}>
      <mesh scale={radius} rotation={[0, t * 0.05, 0]}>
        <sphereGeometry args={[1, 64, 48]} />
        <meshBasicMaterial map={tex} color={'#ffffff'} toneMapped={false} />
      </mesh>
      <Glow scale={radius * 3.2} color={'#ffd9a8'} opacity={0.9 * intensity} />
      <Glow scale={radius * 7} color={'#ff9a3c'} opacity={0.45 * intensity} />
      <Glow scale={radius * 14} color={'#ff7a2f'} opacity={0.18 * intensity} />
    </group>
  );
};
