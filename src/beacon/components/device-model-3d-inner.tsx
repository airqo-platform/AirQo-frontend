"use client"

import { useRef, Suspense, useState, useEffect, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { Loader2 } from 'lucide-react'

interface DeviceModel3DInnerProps {
  onModelLoaded?: () => void
  onModelFailed?: () => void
}

/**
 * Inner 3D Device Model Component
 * This component handles the actual Three.js rendering
 */
function DeviceModel({ onLoad, onError }: Readonly<{ onLoad?: () => void; onError?: () => void }>) {
  const groupRef = useRef<THREE.Group>(null)
  
  // Load the GLB model
  const { scene } = useGLTF('/icons/gen6_assembly.glb')
  
  // Clone the scene to avoid issues with shared materials/textures
  const clonedScene = useMemo(() => {
    if (!scene) {
      onError?.()
      return null
    }
    const clone = scene.clone(true)
    
    // Traverse and handle materials
    clone.traverse((child: any) => {
      if (child instanceof THREE.Mesh) {
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material = child.material.map((mat: any) => mat.clone())
          } else {
            child.material = child.material.clone()
          }
        }
      }
    })
    
    return clone
  }, [scene, onError])
  
  // Notify parent when model is loaded
  useEffect(() => {
    if (clonedScene && onLoad) {
      setTimeout(onLoad, 100)
    }
    if (groupRef.current) {
      groupRef.current.rotation.y = 0.5
      groupRef.current.rotation.x = -0.3
    }
  }, [clonedScene, onLoad])

  if (!clonedScene) return null

  return (
    <group ref={groupRef} position={[-30, -2, 0]}>
      <primitive object={clonedScene} scale={60} />
    </group>
  )
}

// Preload the model
useGLTF.preload('/icons/gen6_assembly.glb')

/**
 * Main 3D Scene Component
 */
export default function DeviceModel3DInner({ onModelLoaded, onModelFailed }: Readonly<DeviceModel3DInnerProps>) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  const handleLoad = () => {
    setIsLoaded(true)
    onModelLoaded?.()
  }

  const handleError = () => {
    setHasError(true)
    onModelFailed?.()
    onModelLoaded?.()
  }

  if (hasError) {
    return null
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
        onCreated={({ gl }) => {
          if (!gl.getContext()) {
            handleError()
          }
        }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={40} />
        
        <ambientLight intensity={0.5} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          intensity={1}
          castShadow
        />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <Suspense fallback={null}>
          <DeviceModel onLoad={handleLoad} onError={handleError} />
          <Environment preset="city" />
        </Suspense>
        
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
