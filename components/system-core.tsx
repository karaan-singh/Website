"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";

type Waypoint = { x: number; y: number; scale: number; turn: number };
const journey: Waypoint[] = [
  { x: 1.65, y: 0.08, scale: 1.15, turn: 0 },
  { x: -1.2, y: -0.52, scale: 0.78, turn: 1.05 },
  { x: 1.45, y: 0.34, scale: 0.72, turn: 2.15 },
  { x: -1.45, y: -0.18, scale: 0.94, turn: 3.8 },
  { x: 1.1, y: 0.3, scale: 0.68, turn: 5.1 },
  { x: 1.35, y: -0.42, scale: 0.48, turn: 6.2 }
];

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

function CoreModel() {
  const group = useRef<THREE.Group>(null);
  const viewport = useThree((state) => state.viewport);
  const pointer = useRef(new THREE.Vector2());
  const goal = useRef({ x: 1.5, y: 0.08, scale: 1.15, turn: 0 });
  const progress = useRef(0);
  const mobile = viewport.width < 7;

  useEffect(() => {
    const onPointer = (event: PointerEvent) => {
      pointer.current.set((event.clientX / window.innerWidth - 0.5) * 0.22, (event.clientY / window.innerHeight - 0.5) * -0.16);
    };
    const onScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      progress.current = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useFrame(({ clock }) => {
    const object = group.current;
    if (!object) return;
    const normalized = THREE.MathUtils.clamp(progress.current, 0, 0.9999) * (journey.length - 1);
    const index = Math.floor(normalized);
    const mix = normalized - index;
    const from = journey[index];
    const to = journey[index + 1] ?? from;
    goal.current.x = lerp(from.x, to.x, mix) * (mobile ? 0.38 : 1);
    goal.current.y = lerp(from.y, to.y, mix);
    goal.current.scale = lerp(from.scale, to.scale, mix) * (mobile ? 0.72 : 1);
    goal.current.turn = lerp(from.turn, to.turn, mix);
    const damp = (current: number, target: number) => THREE.MathUtils.damp(current, target, 2.2, 1 / 60);
    object.position.x = damp(object.position.x, goal.current.x + pointer.current.x);
    object.position.y = damp(object.position.y, goal.current.y + pointer.current.y);
    const scale = damp(object.scale.x, goal.current.scale);
    object.scale.setScalar(scale);
    object.rotation.x = damp(object.rotation.x, goal.current.turn * 0.14 + pointer.current.y * 0.45);
    object.rotation.y = damp(object.rotation.y, goal.current.turn + pointer.current.x * 0.5 + clock.getElapsedTime() * 0.045);
    object.rotation.z = damp(object.rotation.z, Math.sin(clock.getElapsedTime() * 0.18) * 0.12);
  });

  return (
    <group ref={group} position={[1.65, 0.08, 0]}>
      <mesh>
        <icosahedronGeometry args={[0.74, 2]} />
        <meshPhysicalMaterial color="#171c27" metalness={0.78} roughness={0.24} clearcoat={1} clearcoatRoughness={0.16} />
      </mesh>
      <mesh rotation={[0.32, 0.18, 0.2]}>
        <torusGeometry args={[1.03, 0.012, 8, 128]} />
        <meshStandardMaterial color="#496cff" metalness={0.8} roughness={0.24} emissive="#192b72" emissiveIntensity={0.5} />
      </mesh>
      <mesh rotation={[1.02, -0.55, 0.85]}>
        <torusGeometry args={[1.2, 0.009, 8, 128]} />
        <meshStandardMaterial color="#fd5365" metalness={0.72} roughness={0.3} emissive="#6e101f" emissiveIntensity={0.38} />
      </mesh>
      <mesh rotation={[-0.72, 0.8, -0.28]}>
        <torusGeometry args={[0.88, 0.006, 6, 112]} />
        <meshStandardMaterial color="#a8c8ff" metalness={0.8} roughness={0.22} />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((index) => {
        const angle = (index / 6) * Math.PI * 2;
        return (
          <group key={index} position={[Math.cos(angle) * 0.94, Math.sin(angle) * 0.94, Math.sin(angle * 2) * 0.16]}>
            <mesh>
              <octahedronGeometry args={[0.082, 0]} />
              <meshStandardMaterial color={index % 2 ? "#e7e5df" : "#7797ff"} metalness={0.78} roughness={0.22} />
            </mesh>
            <mesh position={[-Math.cos(angle) * 0.1, -Math.sin(angle) * 0.1, 0]} rotation={[0, 0, angle]}>
              <cylinderGeometry args={[0.009, 0.009, 0.17, 6]} />
              <meshStandardMaterial color="#8e98aa" metalness={0.8} roughness={0.3} />
            </mesh>
          </group>
        );
      })}
      <pointLight color="#5175ff" intensity={2.1} distance={4.5} position={[-1.5, 1.5, 1.2]} />
      <pointLight color="#ff5969" intensity={1.3} distance={3.8} position={[1.2, -1.3, -0.8]} />
    </group>
  );
}

export default function SystemCore() {
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  if (reducedMotion) return <div className="core-stage core-stage--still" aria-hidden="true"><span /><i /><b /></div>;

  return (
    <div className="core-stage" aria-hidden="true">
      <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 6], fov: 38 }} gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.72} />
          <directionalLight position={[3, 4, 5]} intensity={1.5} />
          <CoreModel />
        </Suspense>
      </Canvas>
    </div>
  );
}
