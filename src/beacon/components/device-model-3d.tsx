"use client"

import { useRef, Suspense, useState, useEffect, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { Loader2 } from 'lucide-react'

// Suppress THREE.js texture loading warnings in development
// These occur when GLB embedded textures use blob URLs
if (globalThis.window !== undefined) {
  const originalConsoleError = console.error
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes("THREE.GLTFLoader: Couldn't load texture")
    ) {
      // Suppress texture loading warnings - model still renders correctly
      return
    }
    originalConsoleError.apply(console, args)
  }
}

/**
 * 3D Device Model Component
 * Loads and displays the cell phone holder GLB model with interactive controls
 */
function DeviceModel({ onLoad }: Readonly<{ onLoad?: () => void }>) {
  const groupRef = useRef<THREE.Group>(null)
  
  // Load the GLB model
  const { scene } = useGLTF('/gen6_assembly.glb')
  
  // Clone the scene to avoid issues with shared materials/textures
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true)
    
    // Traverse and handle materials that might have problematic textures
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Clone materials to avoid shared state issues
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material = child.material.map((mat) => mat.clone())
          } else {
            child.material = child.material.clone()
          }
        }
      }
    })
    
    return clone
  }, [scene])
  
  // Notify parent when model is loaded
  useEffect(() => {
    if (clonedScene && onLoad) {
      // Small delay to ensure everything is rendered
      setTimeout(onLoad, 100)
    }
    // Set initial rotation to face slightly to the right
    if (groupRef.current) {
      groupRef.current.rotation.y = 0.5
      groupRef.current.rotation.x = -0.3
    }
  }, [clonedScene, onLoad])
  
  // Model is now static - no auto-rotation
  // useFrame((state, delta) => {
  //   if (groupRef.current) {
  //     groupRef.current.rotation.y += delta * 0.2 // Slow rotation
  //   }
  // })

  return (
    <group ref={groupRef} position={[-30, -2, 0]}>
    {/* <group ref={groupRef} position={[0, -5, 0]}></group> */}
      {/* <primitive object={scene} scale={30} /> */}
      <primitive object={clonedScene} scale={60} />
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
export default function DeviceModel3D({ onModelLoaded }: Readonly<{ onModelLoaded?: () => void }>) {
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
