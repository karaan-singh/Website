"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

interface FloatingBlobProps {
  scrollProgress: number;
}

/* -------------------------------------------------------------
 * Ultra-Transparent Crystal Lens Bubble Shader
 * - 100% entirely transparent interior (text & graphics are crystal clear)
 * - Ultra-thin, gossamer iridescent Fresnel rim at the grazing edge only
 * - Crisp, brilliant dual-light specular glints
 * - Zero dark muddy fill or interior occlusion
 * ----------------------------------------------------------- */
const ThoughtLabLensBubbleShader = {
  uniforms: {
    uTime: { value: 0 },
    uVelocity: { value: new THREE.Vector2(0, 0) }
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vWorldPosition;
    uniform float uTime;
    uniform vec2 uVelocity;

    void main() {
      vec3 p = position;

      // Authentic organic liquid surface distortion
      float wave1 = sin(p.y * 3.2 + uTime * 2.4) * cos(p.x * 2.8 - uTime * 1.8);
      float wave2 = sin(p.z * 3.6 + uTime * 2.0) * cos(p.y * 3.1 + uTime * 1.5);
      float microWave = sin(p.x * 6.0 + p.y * 6.0 + uTime * 2.8) * 0.01;
      
      // Dynamic velocity distortion (squash & stretch when cursor moves)
      float speed = length(uVelocity);
      vec3 vel3 = vec3(uVelocity.x, uVelocity.y, 0.0);
      float stretch = dot(normalize(p), normalize(vel3 + vec3(0.0001))) * speed * 0.4;
      
      p += normal * ((wave1 + wave2) * 0.032 + microWave);
      p += vel3 * stretch;

      vNormal = normalize(normalMatrix * normal);
      vPosition = (modelViewMatrix * vec4(p, 1.0)).xyz;
      
      vec4 worldPos = modelMatrix * vec4(p, 1.0);
      vWorldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }
  `,
  fragmentShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vWorldPosition;
    uniform float uTime;

    void main() {
      vec3 n = normalize(vNormal);
      vec3 viewDir = normalize(-vPosition);

      // Optical Fresnel grazing curve - very steep falloff so ONLY the outer 3% edge has any visible edge
      float NdotV = max(dot(n, viewDir), 0.0);
      float thinFresnel = pow(1.0 - NdotV, 5.0);
      float sharpRim = pow(1.0 - NdotV, 9.0);

      // Key light & specular highlight reflections (crystalline glints)
      vec3 light1 = normalize(vec3(0.7, 1.4, 0.8));
      vec3 light2 = normalize(vec3(-0.9, -0.6, 0.7));
      vec3 half1 = normalize(light1 + viewDir);
      vec3 half2 = normalize(light2 + viewDir);

      float spec1 = pow(max(dot(n, half1), 0.0), 64.0);
      float spec2 = pow(max(dot(n, half2), 0.0), 32.0);

      // Pure chromatic soap-bubble / crystal dispersion at the extreme edge
      vec3 violetSheen = vec3(0.72, 0.58, 1.0);
      vec3 cyanSheen = vec3(0.35, 0.88, 1.0);
      vec3 pureWhite = vec3(1.0, 1.0, 1.0);

      float sheenPhase = sin(vWorldPosition.y * 3.5 + uTime * 1.5) * 0.5 + 0.5;
      vec3 rimColor = mix(violetSheen, cyanSheen, sheenPhase);

      // Shading: Pure, luminous edge and crystal white reflection highlights
      vec3 finalColor = mix(rimColor, pureWhite, clamp(sharpRim * 1.2 + spec1 * 1.8, 0.0, 1.0));

      // ALPHA TRANSPARENCY:
      // The interior center of the blob is 100% TRANSPARENT (0.0 opacity).
      // Only the micro-thin outer rim and specular glints have subtle opacity.
      // All underlying text is completely unobstructed and crystal clear!
      float alpha = clamp(thinFresnel * 0.32 + sharpRim * 0.55 + spec1 * 0.92 + spec2 * 0.35, 0.0, 0.88);

      gl_FragColor = vec4(finalColor, alpha);
    }
  `
};

function ThoughtLabInteractiveBubble({ scrollProgress }: { scrollProgress: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  // Position, velocity, and cursor tracking
  const currentPos = useRef(new THREE.Vector3(0, 0, 0));
  const targetPos = useRef(new THREE.Vector3(0, 0, 0));
  const velocity = useRef(new THREE.Vector2(0, 0));
  const pointerPos = useRef(new THREE.Vector2(0, 0));
  const lastPointer = useRef(new THREE.Vector2(0, 0));

  // Default positions per section (if user is not moving cursor):
  const waypoints = [
    { x: 1.5, y: 0.1, z: 0, scale: 1.3 },
    { x: -1.3, y: -0.15, z: 0.1, scale: 1.18 },
    { x: 1.35, y: 0.12, z: -0.1, scale: 1.22 },
    { x: -1.2, y: -0.08, z: 0.05, scale: 1.14 },
    { x: 0.0, y: 0.15, z: 0.2, scale: 1.32 }
  ];

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      // Map screen cursor (-1 to 1) into 3D viewport coordinates
      const x = (e.clientX / window.innerWidth - 0.5) * 6.5;
      const y = (e.clientY / window.innerHeight - 0.5) * -4.2;

      pointerPos.current.set(x, y);

      // Track cursor velocity for fluid squash/stretch
      const vx = (e.clientX - lastPointer.current.x) * 0.005;
      const vy = -(e.clientY - lastPointer.current.y) * 0.005;
      velocity.current.set(
        THREE.MathUtils.clamp(vx, -0.6, 0.6),
        THREE.MathUtils.clamp(vy, -0.6, 0.6)
      );
      lastPointer.current.set(e.clientX, e.clientY);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, []);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    if (!meshRef.current) return;

    // Interpolate scroll progress anchor
    const norm =
      THREE.MathUtils.clamp(scrollProgress, 0, 0.999) * (waypoints.length - 1);
    const idx = Math.floor(norm);
    const frac = norm - idx;
    const p1 = waypoints[idx];
    const p2 = waypoints[idx + 1] ?? p1;

    // Follow cursor directly with smooth elastic spring (exact working principle in rec2)
    const baseAnchorX = THREE.MathUtils.lerp(p1.x, p2.x, frac);
    const baseAnchorY = THREE.MathUtils.lerp(p1.y, p2.y, frac);

    // Blends cursor position with natural floating sway
    const naturalFloatY = Math.sin(time * 1.8) * 0.06;
    const naturalFloatX = Math.cos(time * 1.2) * 0.04;

    // Target smoothly follows pointer if active, else defaults to section anchor
    targetPos.current.x = pointerPos.current.x * 0.75 + baseAnchorX * 0.25 + naturalFloatX;
    targetPos.current.y = pointerPos.current.y * 0.75 + baseAnchorY * 0.25 + naturalFloatY;
    targetPos.current.z = THREE.MathUtils.lerp(p1.z, p2.z, frac);

    // Fluid damping (smooth spring lag matching rec2.mp4)
    const smoothFactor = 0.085;
    currentPos.current.x = THREE.MathUtils.lerp(currentPos.current.x, targetPos.current.x, smoothFactor);
    currentPos.current.y = THREE.MathUtils.lerp(currentPos.current.y, targetPos.current.y, smoothFactor);
    currentPos.current.z = THREE.MathUtils.lerp(currentPos.current.z, targetPos.current.z, smoothFactor);

    meshRef.current.position.copy(currentPos.current);

    // Scale interpolation
    const targetScale = THREE.MathUtils.lerp(p1.scale, p2.scale, frac);
    meshRef.current.scale.setScalar(
      THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.08)
    );

    // Fade velocity back to 0
    velocity.current.multiplyScalar(0.92);

    // Rotate slowly with organic 3D wobble
    meshRef.current.rotation.y += 0.003 + velocity.current.x * 0.05;
    meshRef.current.rotation.x += Math.sin(time * 0.8) * 0.002 - velocity.current.y * 0.05;

    // Update material uniforms
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = time;
      matRef.current.uniforms.uVelocity.value.copy(velocity.current);
    }
  });

  return (
    <mesh ref={meshRef} position={[1.5, 0.1, 0]}>
      {/* High-definition sphere for fluid organic distortion */}
      <sphereGeometry args={[1.32, 128, 128]} />
      <shaderMaterial
        ref={matRef}
        args={[ThoughtLabLensBubbleShader]}
        transparent
        depthWrite={false}
        side={THREE.FrontSide}
      />
    </mesh>
  );
}

export default function FloatingBlob({ scrollProgress }: FloatingBlobProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.0], fov: 45 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
      }}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 50 // Sits directly over page content so you can see website text through the bubble
      }}
    >
      <ambientLight intensity={1.5} />
      <directionalLight position={[3, 5, 4]} intensity={2.6} color="#ffffff" />
      <directionalLight position={[-3, -3, 2]} intensity={1.4} color="#dbeeff" />
      <ThoughtLabInteractiveBubble scrollProgress={scrollProgress} />
    </Canvas>
  );
}
