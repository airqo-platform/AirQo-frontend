"use client"

import { useRef, Suspense, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { Loader2 } from 'lucide-react'

/**
 * 3D Device Model Component
 * Loads and displays the cell phone holder GLB model with interactive controls
 */
function DeviceModel({ onLoad }: { onLoad?: () => void }) {
  const groupRef = useRef<THREE.Group>(null)
  
  // Load the GLB model
  const { scene } = useGLTF('/gen6_assembly.glb')
  
  // Notify parent when model is loaded
  useEffect(() => {
    if (scene && onLoad) {
      // Small delay to ensure everything is rendered
      setTimeout(onLoad, 100)
    }
  }, [scene, onLoad])
  
  // Auto-rotate the model slowly
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.2 // Slow rotation
    }
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
    {/* <group ref={groupRef} position={[0, -5, 0]}></group> */}
      {/* <primitive object={scene} scale={30} /> */}
      <primitive object={scene} scale={120} />
    </group>
  )
}

/**
 * Loading fallback component
 */
function Loader() {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-blue-300 via-blue-400 to-blue-500">
      <Loader2 className="h-16 w-16 text-white animate-spin mb-4" />
      <div className="text-white text-xl font-semibold">Loading 3D Experience...</div>
      <div className="text-blue-100 text-sm mt-2">Preparing interactive device model</div>
    </div>
  )
}

/**
 * Main 3D Scene Component
 */
export default function DeviceModel3D({ onModelLoaded }: { onModelLoaded?: () => void }) {
  const [isLoaded, setIsLoaded] = useState(false)

  const handleLoad = () => {
    setIsLoaded(true)
    if (onModelLoaded) {
      onModelLoaded()
    }
  }

  return (
    <div className="w-full h-full relative">
      {/* Loading Overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-br from-blue-300 via-blue-400 to-blue-500">
          <Loader2 className="h-16 w-16 text-white animate-spin mb-4" />
          <div className="text-white text-xl font-semibold">Loading 3D Experience...</div>
          <div className="text-blue-100 text-sm mt-2">Preparing interactive device model</div>
        </div>
      )}
      
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true }}
        className="bg-gradient-to-br from-blue-300 via-blue-400 to-blue-500"
      >
        {/* Camera setup */}
        <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={40} />
        
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          intensity={1}
          castShadow
        />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        {/* 3D Model */}
        <Suspense fallback={null}>
          <DeviceModel onLoad={handleLoad} />
          <Environment preset="city" />
        </Suspense>
        
        {/* Interactive controls */}
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          autoRotate={false}
          minDistance={6}
          maxDistance={20}
        />
      </Canvas>
    </div>
  )
}

// Preload the model
useGLTF.preload('/gen6_assembly.glb')
