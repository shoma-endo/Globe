'use client';

import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars, Sparkles, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useRef, useEffect, useState } from 'react';
import { latLngToVector3 } from '@/utils/coords';

type Props = {
  target: { lat: number; lng: number } | null;
};

function Earth({ isRotating }: { isRotating: boolean }) {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  const [colorMap, normalMap, specularMap, cloudsMap] = useLoader(THREE.TextureLoader, [
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png'
  ]);
  
  useFrame(() => {
    if (earthRef.current && isRotating) {
      earthRef.current.rotation.y += 0.0005;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.0007; // Clouds rotate slightly faster
    }
  });

  return (
    <group>
      {/* Earth Surface */}
      <mesh ref={earthRef} receiveShadow castShadow>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial 
          map={colorMap} 
          normalMap={normalMap} 
          specularMap={specularMap} 
          specular={new THREE.Color('grey')} 
          shininess={10}
        />
      </mesh>
      {/* Clouds Layer */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[2.02, 64, 64]} />
        <meshPhongMaterial 
          map={cloudsMap} 
          transparent 
          opacity={0.8} 
          depthWrite={false} 
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function Pin({ position }: { position: THREE.Vector3 }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.05, 16, 16]} />
      <meshStandardMaterial color="red" emissive="#ff0000" emissiveIntensity={0.5} />
    </mesh>
  );
}

function CameraController({ target }: { target: { lat: number; lng: number } | null }) {
  const { camera, controls } = useLoader(THREE.TextureLoader, 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg') as any; // Hack to get access to camera/controls context if needed, but actually useThree is better.
  // Wait, useLoader returns the loaded asset. I need useThree.
  return null;
}

// Correct CameraController using useThree
function CameraRig({ target }: { target: { lat: number; lng: number } | null }) {
  const { camera, controls } = useThree();
  const targetPosRef = useRef<THREE.Vector3 | null>(null);

  useEffect(() => {
    if (target) {
      // Calculate target position on sphere surface (radius 2)
      // Add a bit of distance for the camera (radius + distance)
      const surfacePos = latLngToVector3(target.lat, target.lng, 2);
      const cameraPos = latLngToVector3(target.lat, target.lng, 4.5); // Distance 4.5 from center

      // Animate camera
      // We'll just set it for now, or use a simple lerp in useFrame if we want smooth
      // For simplicity in this step, let's use a library or simple interpolation
      // But user requested "smooth animation 0.2-0.6s".
      
      // Let's use a simple state to trigger animation
      targetPosRef.current = cameraPos;
    }
  }, [target]);

  useFrame((state, delta) => {
    if (targetPosRef.current) {
      state.camera.position.lerp(targetPosRef.current, 0.1);
      state.camera.lookAt(0, 0, 0); // Always look at center
      
      // Stop lerping if close enough? 
      if (state.camera.position.distanceTo(targetPosRef.current) < 0.01) {
         // targetPosRef.current = null; // Keep locking or release?
         // If we release, OrbitControls takes over.
      }
    }
  });

  return null;
}

// Re-implementing correctly with imports
import { useThree } from '@react-three/fiber';

function SceneContent({ target }: Props) {
  const { camera } = useThree();
  
  // Initial camera position
  useEffect(() => {
    camera.position.set(0, 0, 5);
  }, [camera]);

  const pinPosition = target ? latLngToVector3(target.lat, target.lng, 2) : null;

  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[10, 10, 5]} intensity={2.5} />
      <Stars radius={300} depth={60} count={20000} factor={7} saturation={0} fade speed={1} />
      <Sparkles count={2000} scale={12} size={2} speed={0.4} opacity={0.5} color="#ffffff" />
      
      <Earth isRotating={!target} />
      {pinPosition && <Pin position={pinPosition} />}
      
      <CameraRig target={target} />
      <OrbitControls enablePan={false} minDistance={2.5} maxDistance={10} />
    </>
  );
}

export default function EarthScene({ target }: Props) {
  return (
    <div className="w-full h-screen bg-black">
      <Canvas shadows camera={{ position: [0, 0, 5], fov: 45 }}>
        <SceneContent target={target} />
      </Canvas>
    </div>
  );
}
