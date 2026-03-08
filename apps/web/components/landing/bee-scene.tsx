"use client"

import { useRef, useMemo, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

/* ─── Trail ─── */
function BeeTrail({ positions }: { positions: { x: number; y: number; opacity: number }[] }) {
  return (
    <>
      {positions.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, 2]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color="#FEC800" transparent opacity={p.opacity * 0.6} />
        </mesh>
      ))}
    </>
  )
}

/* ─── Bee ─── */
function Bee() {
  const groupRef = useRef<THREE.Group>(null)
  const wingLRef = useRef<THREE.Mesh>(null)
  const wingRRef = useRef<THREE.Mesh>(null)
  const mouse = useRef({ x: 0, y: 0 })
  const velocity = useRef({ x: 0 })
  const trailTimer = useRef(0)
  const [trail, setTrail] = useState<{ x: number; y: number; opacity: number }[]>([])
  const { size } = useThree()

  useMemo(() => {
    const handler = (e: MouseEvent) => {
      mouse.current.x = ((e.clientX / size.width) * 2 - 1) * 3
      mouse.current.y = -((e.clientY / size.height) * 2 - 1) * 2
    }
    window.addEventListener("mousemove", handler)
    return () => window.removeEventListener("mousemove", handler)
  }, [size.width, size.height])

  useFrame((state, delta) => {
    if (!groupRef.current) return
    const t = state.clock.getElapsedTime()
    const prevX = groupRef.current.position.x
    groupRef.current.position.x += (mouse.current.x - groupRef.current.position.x) * 0.05
    groupRef.current.position.y += (mouse.current.y + 0.5 - groupRef.current.position.y) * 0.05
    velocity.current.x = groupRef.current.position.x - prevX
    groupRef.current.rotation.z = -velocity.current.x * 2
    if (wingLRef.current) wingLRef.current.rotation.z = Math.sin(t * 15) * 0.3 + 0.3
    if (wingRRef.current) wingRRef.current.rotation.z = -(Math.sin(t * 15) * 0.3 + 0.3)
    groupRef.current.position.y += Math.sin(t * 3) * 0.003

    trailTimer.current += delta
    if (trailTimer.current > 0.08) {
      trailTimer.current = 0
      const speed = Math.abs(velocity.current.x)
      if (speed > 0.005) {
        setTrail((prev) => {
          const next = [
            { x: groupRef.current!.position.x, y: groupRef.current!.position.y, opacity: 0.3 },
            ...prev.map((p) => ({ ...p, opacity: p.opacity - 0.06 })).filter((p) => p.opacity > 0),
          ]
          return next.slice(0, 4)
        })
      } else {
        setTrail((prev) =>
          prev.map((p) => ({ ...p, opacity: p.opacity - 0.06 })).filter((p) => p.opacity > 0)
        )
      }
    }
  })

  return (
    <>
      <BeeTrail positions={trail} />
      <group ref={groupRef} position={[0, 0.5, 2]} scale={0.8}>
        {/* Body */}
        <mesh>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial color="#FEC800" />
        </mesh>
        {/* Stripes */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.4, 0.03, 8, 24]} />
          <meshStandardMaterial color="#1a1a00" />
        </mesh>
        <mesh position={[0.15, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.37, 0.025, 8, 24]} />
          <meshStandardMaterial color="#1a1a00" />
        </mesh>
        {/* Head */}
        <mesh position={[-0.45, 0.06, 0]}>
          <sphereGeometry args={[0.25, 12, 12]} />
          <meshStandardMaterial color="#FEC800" />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.62, 0.15, 0.15]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        <mesh position={[-0.62, 0.15, -0.15]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        {/* Wing Left */}
        <mesh ref={wingLRef} position={[0, 0.35, 0.25]}>
          <planeGeometry args={[0.35, 0.2]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
        {/* Wing Right */}
        <mesh ref={wingRRef} position={[0, 0.35, -0.25]}>
          <planeGeometry args={[0.35, 0.2]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </>
  )
}

/* ─── Floating particles ─── */
function Particles() {
  const count = 30
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const speeds = useMemo(() => Array.from({ length: count }, () => 0.2 + Math.random() * 0.5), [])
  const offsets = useMemo(() => Array.from({ length: count }, () => Math.random() * Math.PI * 2), [])
  const positions = useMemo(
    () =>
      Array.from({ length: count }, () => [
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 4,
      ]),
    []
  )

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    for (let i = 0; i < count; i++) {
      const [x, y, z] = positions[i]
      dummy.position.set(
        x + Math.sin(t * speeds[i] + offsets[i]) * 0.5,
        y + Math.cos(t * speeds[i] * 0.7 + offsets[i]) * 0.3,
        z
      )
      dummy.scale.setScalar(0.03 + Math.sin(t * 2 + offsets[i]) * 0.01)
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current!.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#FEC800" transparent opacity={0.4} />
    </instancedMesh>
  )
}

/* ─── Scene ─── */
export default function BeeScene() {
  return (
    <div className="absolute inset-0 z-0" style={{ pointerEvents: "none" }}>
      <Canvas
        gl={{ alpha: true, antialias: true }}
        camera={{ position: [0, 1, 8], fov: 45 }}
        style={{ pointerEvents: "auto" }}
      >
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} intensity={0.5} />
        <Particles />
        <Bee />
      </Canvas>
    </div>
  )
}
