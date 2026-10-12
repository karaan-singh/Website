"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// --- Simplex / Perlin-like 2D Noise Helper ---
function createNoise2D() {
  const p = new Uint8Array(512);
  const perm = new Uint8Array(256);
  for (let i = 0; i < 256; i++) perm[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = perm[i];
    perm[i] = perm[j];
    perm[j] = temp;
  }
  for (let i = 0; i < 512; i++) p[i] = perm[i & 255];

  function grad(hash: number, x: number, y: number) {
    const h = hash & 7;
    const u = h < 4 ? x : y;
    const v = h < 4 ? y : x;
    return (h & 1 ? -u : u) + (h & 2 ? -2.0 * v : 2.0 * v);
  }

  return function noise(xin: number, yin: number): number {
    const X = Math.floor(xin) & 255;
    const Y = Math.floor(yin) & 255;
    const x = xin - Math.floor(xin);
    const y = yin - Math.floor(yin);
    const u = x * x * x * (x * (x * 6 - 15) + 10);
    const v = y * y * y * (y * (y * 6 - 15) + 10);
    const a = p[X] + Y;
    const b = p[X + 1] + Y;
    return (
      (1 - v) *
        ((1 - u) * grad(p[a], x, y) + u * grad(p[b], x - 1, y)) +
      v *
        ((1 - u) * grad(p[a + 1], x, y - 1) + u * grad(p[b + 1], x - 1, y - 1))
    );
  };
}

const noise = createNoise2D();

function fbm(x: number, y: number, octaves = 5) {
  let value = 0;
  let amplitude = 1;
  let freq = 1;
  for (let i = 0; i < octaves; i++) {
    value += noise(x * freq, y * freq) * amplitude;
    amplitude *= 0.5;
    freq *= 2.05;
  }
  return value;
}

// Valley center curve X(z)
export function getRiverPath(z: number): number {
  return Math.sin(z * 0.015) * 14 + Math.sin(z * 0.038) * 7;
}

export function getTerrainHeightAt(x: number, z: number): number {
  const centerX = getRiverPath(z);
  const distFromRiver = Math.abs(x - centerX);
  const valleyWidth = 26;
  if (distFromRiver <= valleyWidth) {
    const factor = Math.pow(distFromRiver / valleyWidth, 2.0);
    return factor * 3.5 + noise(x * 0.05, z * 0.05) * 0.8;
  }
  const dNorm = (distFromRiver - valleyWidth) * 0.048;
  const mountainFactor = Math.pow(dNorm, 1.35) * 20;
  const detail = fbm(x * 0.012, z * 0.012, 5) * 24;
  return Math.max(0, mountainFactor + detail);
}

interface ValleyProps {
  progress: number;
}

/* -------------------------------------------------------------
 * 1. Rich Procedural Terrain & Cave Arch
 * ----------------------------------------------------------- */
function ProceduralValleyTerrain({ progress }: { progress: number }) {
  const { terrainGeometry, caveGeometry } = useMemo(() => {
    const w = 280;
    const d = 540;
    const segW = 160;
    const segD = 260;
    const geo = new THREE.PlaneGeometry(w, d, segW, segD);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);

    // Realistic alpine biome colors
    const deepGrass = new THREE.Color("#436b3e");
    const sunlitGrass = new THREE.Color("#749b58");
    const cliffRock = new THREE.Color("#5a6266");
    const graniteRidge = new THREE.Color("#828d94");
    const snowCap = new THREE.Color("#e6edf2");
    const shoreSand = new THREE.Color("#a8b39f");

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      let elevation = getTerrainHeightAt(x, z);

      // Natural cave threshold at z < 25
      if (z < 25) {
        const caveArch = Math.max(0, 1 - z / 25);
        if (Math.abs(x) < 20) {
          elevation *= 1 - caveArch * 0.85;
        }
      }

      pos.setY(i, elevation);

      const centerX = getRiverPath(z);
      const distFromRiver = Math.abs(x - centerX);
      const c = new THREE.Color();

      if (distFromRiver < 28) {
        c.copy(shoreSand).lerp(deepGrass, distFromRiver / 28);
      } else if (elevation > 52) {
        c.copy(graniteRidge).lerp(snowCap, Math.min(1, (elevation - 52) / 18));
      } else if (elevation > 28) {
        c.copy(cliffRock).lerp(graniteRidge, (elevation - 28) / 24);
      } else {
        c.copy(deepGrass).lerp(sunlitGrass, elevation / 28);
      }

      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();

    // Cave Entrance Arch Mesh
    const caveG = new THREE.CylinderGeometry(16, 26, 75, 36, 24, true);
    caveG.rotateZ(Math.PI / 2);
    caveG.translate(0, 8.5, -10);
    const cavePos = caveG.attributes.position;
    for (let j = 0; j < cavePos.count; j++) {
      const cx = cavePos.getX(j);
      const cy = cavePos.getY(j);
      const cz = cavePos.getZ(j);
      const deform = noise(cx * 0.1, cz * 0.1) * 3.4;
      cavePos.setY(j, cy + deform);
    }
    caveG.computeVertexNormals();

    return { terrainGeometry: geo, caveGeometry: caveG };
  }, []);

  return (
    <group position={[0, -2, 220]}>
      <mesh geometry={terrainGeometry} receiveShadow castShadow>
        <meshStandardMaterial
          vertexColors
          roughness={0.72}
          metalness={0.08}
          flatShading={true}
        />
      </mesh>

      <mesh geometry={caveGeometry} position={[0, 0, -230]}>
        <meshStandardMaterial
          color="#424741"
          roughness={0.92}
          side={THREE.DoubleSide}
          flatShading={true}
        />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------
 * 2. Instanced Pine Forest along the valley slopes
 * ----------------------------------------------------------- */
function PineForest() {
  const count = 420;
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const { matrices, colors } = useMemo(() => {
    const dummy = new THREE.Object3D();
    const mats: THREE.Matrix4[] = [];
    const cols = new Float32Array(count * 3);
    const pineDark = new THREE.Color("#1f3d23");
    const pineLight = new THREE.Color("#355e3b");
    const autumnTone = new THREE.Color("#4a5e2d");

    let idx = 0;
    for (let i = 0; i < count; i++) {
      // Scatter along riverbanks and lower slopes
      const z = -15 + Math.random() * 460;
      const side = Math.random() > 0.5 ? 1 : -1;
      const offset = 18 + Math.random() * 55;
      const x = getRiverPath(z) + side * offset;
      const y = getTerrainHeightAt(x, z) - 1.8;

      dummy.position.set(x, y, z - 20);
      const scale = 0.7 + Math.random() * 0.9;
      dummy.scale.set(scale, scale * (1.1 + Math.random() * 0.4), scale);
      dummy.rotation.y = Math.random() * Math.PI * 2;
      dummy.rotation.z = (Math.random() - 0.5) * 0.1;
      dummy.updateMatrix();

      mats.push(dummy.matrix.clone());

      const c = new THREE.Color().copy(pineDark).lerp(
        Math.random() > 0.3 ? pineLight : autumnTone,
        Math.random()
      );
      cols[idx * 3] = c.r;
      cols[idx * 3 + 1] = c.g;
      cols[idx * 3 + 2] = c.b;
      idx++;
    }

    return { matrices: mats, colors: cols };
  }, []);

  useEffect(() => {
    if (!meshRef.current) return;
    matrices.forEach((mat, i) => {
      meshRef.current!.setMatrixAt(i, mat);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [matrices]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, count]}
      castShadow
      receiveShadow
    >
      <coneGeometry args={[1.6, 5.2, 5]} />
      <meshStandardMaterial
        color="#2c4e30"
        roughness={0.82}
        flatShading={true}
      />
    </instancedMesh>
  );
}

/* -------------------------------------------------------------
 * 3. Riverbed Boulders & Rocks
 * ----------------------------------------------------------- */
function RiverRocks() {
  const count = 90;
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const matrices = useMemo(() => {
    const dummy = new THREE.Object3D();
    const mats: THREE.Matrix4[] = [];

    for (let i = 0; i < count; i++) {
      const z = -10 + Math.random() * 440;
      const riverCenter = getRiverPath(z);
      const offset = (Math.random() - 0.5) * 14;
      const x = riverCenter + offset;
      const y = -1.2 + Math.random() * 0.6;

      dummy.position.set(x, y, z - 20);
      const s = 0.6 + Math.random() * 1.2;
      dummy.scale.set(s * 1.3, s * 0.7, s);
      dummy.rotation.set(
        Math.random() * 0.4,
        Math.random() * Math.PI,
        Math.random() * 0.4
      );
      dummy.updateMatrix();
      mats.push(dummy.matrix.clone());
    }
    return mats;
  }, []);

  useEffect(() => {
    if (!meshRef.current) return;
    matrices.forEach((mat, i) => {
      meshRef.current!.setMatrixAt(i, mat);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [matrices]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, count]}
      castShadow
      receiveShadow
    >
      <dodecahedronGeometry args={[1.2, 1]} />
      <meshStandardMaterial
        color="#737c80"
        roughness={0.85}
        flatShading={true}
      />
    </instancedMesh>
  );
}

/* -------------------------------------------------------------
 * 4. Winding River Ribbon with Animated Shimmer
 * ----------------------------------------------------------- */
function RiverWater({ progress }: { progress: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  const riverGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let z = -20; z <= 480; z += 4) {
      const x = getRiverPath(z);
      points.push(new THREE.Vector3(x, 0.4, z));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    return new THREE.TubeGeometry(curve, 190, 6.4, 8, false);
  }, []);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const time = clock.getElapsedTime();
      const mat = meshRef.current.material as THREE.MeshPhysicalMaterial;
      // Gentle surface shimmer
      mat.roughness = 0.08 + Math.sin(time * 1.2) * 0.03;
      // Day to night river glow transition
      if (progress > 0.6) {
        const nightT = (progress - 0.6) / 0.4;
        mat.emissiveIntensity = 0.15 + nightT * 0.45;
        mat.emissive.set("#3aa4b5");
      } else {
        mat.emissiveIntensity = 0.12;
        mat.emissive.set("#1f5f6b");
      }
    }
  });

  return (
    <mesh
      ref={meshRef}
      geometry={riverGeometry}
      position={[0, -1.8, -40]}
      scale={[1, 0.1, 1]}
    >
      <meshPhysicalMaterial
        color="#43a6b5"
        emissive="#1b5a66"
        emissiveIntensity={0.15}
        roughness={0.1}
        metalness={0.15}
        transmission={0.7}
        ior={1.33}
        transparent
        opacity={0.92}
      />
    </mesh>
  );
}

/* -------------------------------------------------------------
 * 5. Dynamic Multicolored Stars & Atmospheric Valley Motes
 * ----------------------------------------------------------- */
function StarField({ progress }: { progress: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const { starPositions, starColors } = useMemo(() => {
    const count = 2400;
    const pos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);
    const colWhite = new THREE.Color("#ffffff");
    const colBlue = new THREE.Color("#bae6fd");
    const colAmber = new THREE.Color("#fed7aa");

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 0.9);
      const rad = 280 + Math.random() * 50;
      pos[i * 3] = rad * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = rad * Math.cos(phi) + 12;
      pos[i * 3 + 2] = rad * Math.sin(phi) * Math.sin(theta);

      const r = Math.random();
      const c = r > 0.65 ? colBlue : r > 0.35 ? colAmber : colWhite;
      cols[i * 3] = c.r;
      cols[i * 3 + 1] = c.g;
      cols[i * 3 + 2] = c.b;
    }
    return { starPositions: pos, starColors: cols };
  }, []);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      const mat = pointsRef.current.material as THREE.PointsMaterial;
      const time = clock.getElapsedTime();
      // Fades in when scrolling past sunset (progress > 0.45)
      const starAlpha = Math.max(0, (progress - 0.45) / 0.45);
      const twinkle = 0.9 + Math.sin(time * 2.2) * 0.08;
      mat.opacity = starAlpha * twinkle;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[starPositions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[starColors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={1.3}
        vertexColors
        transparent
        opacity={0}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function AtmosphericMotes({ progress }: { progress: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const { motesPositions } = useMemo(() => {
    const count = 380;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 90;
      pos[i * 3 + 1] = 1.0 + Math.random() * 20;
      pos[i * 3 + 2] = -20 + Math.random() * 380;
    }
    return { motesPositions: pos };
  }, []);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      const time = clock.getElapsedTime();
      const pos = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i);
        y += Math.sin(time * 0.8 + i) * 0.008;
        pos.setY(i, y);
      }
      pos.needsUpdate = true;

      const mat = pointsRef.current.material as THREE.PointsMaterial;
      // Golden sunlit pollen in day, glowing firefly stardust at night
      if (progress > 0.6) {
        mat.color.set("#7dd3fc");
        mat.opacity = 0.65;
      } else {
        mat.color.set("#fef08a");
        mat.opacity = 0.45;
      }
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[motesPositions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={1.6}
        color="#fef08a"
        transparent
        opacity={0.4}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* -------------------------------------------------------------
 * 6. Dynamic Day -> Golden Sunset -> Starlit Night Cycle
 * ----------------------------------------------------------- */
function DynamicAtmosphere({ progress }: { progress: number }) {
  const { scene } = useThree();
  const sunLightRef = useRef<THREE.DirectionalLight>(null);
  const moonLightRef = useRef<THREE.DirectionalLight>(null);
  const ambientLightRef = useRef<THREE.AmbientLight>(null);

  useFrame(() => {
    // 3 Distinct Time Periods as user scrolls:
    // 1. Crisp Luminous Morning Day (0.0 to 0.4)
    // 2. Warm Amber Golden Sunset (0.4 to 0.7)
    // 3. Starlit Midnight Blue (0.7 to 1.0)
    const dayFog = new THREE.Color("#e4eee8");
    const sunsetFog = new THREE.Color("#dca089");
    const nightFog = new THREE.Color("#0c1524");

    const daySky = new THREE.Color("#cbe1eb");
    const sunsetSky = new THREE.Color("#c26858");
    const nightSky = new THREE.Color("#050c18");

    const currentFog = new THREE.Color();
    const currentSky = new THREE.Color();

    if (progress < 0.45) {
      const t = progress / 0.45;
      currentFog.copy(dayFog).lerp(sunsetFog, t);
      currentSky.copy(daySky).lerp(sunsetSky, t);
    } else {
      const t = (progress - 0.45) / 0.55;
      currentFog.copy(sunsetFog).lerp(nightFog, t);
      currentSky.copy(sunsetSky).lerp(nightSky, t);
    }

    // Lower fog density for crystal clarity
    scene.fog = new THREE.FogExp2(
      currentFog.getHex(),
      0.0028 + (1 - progress) * 0.0012
    );
    scene.background = currentSky;

    // Sun movement & color transformation
    if (sunLightRef.current && ambientLightRef.current) {
      if (progress < 0.45) {
        const t = progress / 0.45;
        sunLightRef.current.color.set(
          new THREE.Color("#fffbe8").lerp(new THREE.Color("#ff9359"), t)
        );
        sunLightRef.current.intensity = 2.8 - t * 0.6;
        ambientLightRef.current.color.set(
          new THREE.Color("#c8dcce").lerp(new THREE.Color("#d99679"), t)
        );
        ambientLightRef.current.intensity = 1.3 - t * 0.3;
      } else {
        const t = (progress - 0.45) / 0.55;
        sunLightRef.current.color.set(
          new THREE.Color("#ff9359").lerp(new THREE.Color("#2a426b"), t)
        );
        sunLightRef.current.intensity = Math.max(0.2, 2.2 - t * 1.8);
        ambientLightRef.current.color.set(
          new THREE.Color("#d99679").lerp(new THREE.Color("#16253b"), t)
        );
        ambientLightRef.current.intensity = Math.max(0.35, 1.0 - t * 0.6);
      }
    }
  });

  return (
    <>
      <ambientLight ref={ambientLightRef} intensity={1.3} />
      <directionalLight
        ref={sunLightRef}
        position={[50, 75, -20]}
        intensity={2.8}
        castShadow
      />
      <directionalLight
        ref={moonLightRef}
        position={[-35, 60, 120]}
        intensity={0.65}
        color="#8abcf0"
      />
    </>
  );
}

/* -------------------------------------------------------------
 * 7. Camera Rig following River Path with Upward Milky Way Look
 * ----------------------------------------------------------- */
function CameraRig({ progress }: { progress: number }) {
  const { camera } = useThree();

  useFrame(() => {
    const startZ = -25;
    const endZ = 300;
    const currentZ = THREE.MathUtils.lerp(startZ, endZ, progress);

    const riverX = getRiverPath(currentZ);
    const targetX = riverX + 1.2;
    const targetY = 3.6 + Math.sin(progress * Math.PI) * 4.2;

    const lookAheadZ = currentZ + 45;
    const lookAheadX = getRiverPath(lookAheadZ);
    // At night (end of scroll), gaze upwards into the starlit sky
    const lookAheadY =
      progress > 0.65
        ? 6.0 + Math.pow((progress - 0.65) / 0.35, 1.6) * 32
        : 4.2;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.08);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.08);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, currentZ, 0.08);

    camera.lookAt(lookAheadX, lookAheadY, lookAheadZ);
  });

  return null;
}

/* -------------------------------------------------------------
 * Main 3D Valley Canvas Scene
 * ----------------------------------------------------------- */
export default function ValleyJourneyScene({ progress }: ValleyProps) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 4, -25], fov: 52, near: 0.1, far: 500 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none"
      }}
    >
      <DynamicAtmosphere progress={progress} />
      <CameraRig progress={progress} />
      <ProceduralValleyTerrain progress={progress} />
      <PineForest />
      <RiverRocks />
      <RiverWater progress={progress} />
      <StarField progress={progress} />
      <AtmosphericMotes progress={progress} />
    </Canvas>
  );
}
