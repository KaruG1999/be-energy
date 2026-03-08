"use client"

import { useRef, useMemo, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

/* ============================================
   Bee Trail — fading spheres behind the bee
   ============================================ */

function BeeTrail({ positions }: { positions: { x: number; y: number; opacity: number }[] }) {
  return (
    <>
      {positions.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, 2]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshBasicMaterial color="#FFD600" transparent opacity={p.opacity} />
        </mesh>
      ))}
    </>
  )
}

/* ============================================
   Bee — follows mouse with lerp, bigger + trail
   ============================================ */

function Bee() {
  const groupRef = useRef<THREE.Group>(null)
  const wingLRef = useRef<THREE.Mesh>(null)
  const wingRRef = useRef<THREE.Mesh>(null)
  const mouse = useRef({ x: 0, y: 0 })
  const velocity = useRef({ x: 0 })
  const trailTimer = useRef(0)
  const [trail, setTrail] = useState<{ x: number; y: number; opacity: number }[]>([])

  const { size } = useThree()

  // Track mouse
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

    // Lerp position
    const prevX = groupRef.current.position.x
    groupRef.current.position.x += (mouse.current.x - groupRef.current.position.x) * 0.05
    groupRef.current.position.y += (mouse.current.y + 0.5 - groupRef.current.position.y) * 0.05

    // Velocity for tilt
    velocity.current.x = groupRef.current.position.x - prevX
    groupRef.current.rotation.z = -velocity.current.x * 2

    // Wing flap
    if (wingLRef.current) wingLRef.current.rotation.z = Math.sin(t * 15) * 0.3 + 0.3
    if (wingRRef.current) wingRRef.current.rotation.z = -(Math.sin(t * 15) * 0.3 + 0.3)

    // Subtle bob
    groupRef.current.position.y += Math.sin(t * 3) * 0.003

    // Trail: spawn a dot every 0.08s
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
      <group ref={groupRef} position={[0, 0.5, 2]} scale={1}>
        {/* Body */}
        <mesh>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial color="#FFD600" />
        </mesh>

        {/* Stripes */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
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
          <meshStandardMaterial color="#FFD600" />
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
          <meshStandardMaterial color="#ffffff" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>

        {/* Wing Right */}
        <mesh ref={wingRRef} position={[0, 0.35, -0.25]}>
          <planeGeometry args={[0.35, 0.2]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </>
  )
}

/* ============================================
   Single Panel — wireframe + internal cell grid + glow
   ============================================ */

function SolarPanel({ position }: { position: [number, number, number] }) {
  const cellLines = useMemo(() => {
    // 3 columns x 2 rows internal grid lines on the panel face
    const lines: THREE.Vector3[] = []
    const w = 2.5
    const d = 1.5

    // Vertical lines (3 cols = 2 internal lines)
    for (let i = 1; i <= 2; i++) {
      const x = -w / 2 + (w / 3) * i
      lines.push(new THREE.Vector3(x, 0.04, -d / 2))
      lines.push(new THREE.Vector3(x, 0.04, d / 2))
    }

    // Horizontal line (2 rows = 1 internal line)
    lines.push(new THREE.Vector3(-w / 2, 0.04, 0))
    lines.push(new THREE.Vector3(w / 2, 0.04, 0))

    return lines
  }, [])

  const lineGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(cellLines)
    return geo
  }, [cellLines])

  return (
    <group position={position}>
      {/* Main wireframe panel */}
      <mesh>
        <boxGeometry args={[2.5, 0.06, 1.5]} />
        <meshBasicMaterial color="#00d96f" wireframe transparent opacity={0.5} />
      </mesh>

      {/* Cell grid lines */}
      <lineSegments geometry={lineGeo}>
        <lineBasicMaterial color="#00d96f" transparent opacity={0.2} />
      </lineSegments>

      {/* Glow layer */}
      <mesh scale={[1.04, 1.5, 1.04]}>
        <boxGeometry args={[2.5, 0.06, 1.5]} />
        <meshBasicMaterial color="#00d96f" transparent opacity={0.05} />
      </mesh>
    </group>
  )
}

/* ============================================
   Solar Panels — grid of 6
   ============================================ */

function SolarPanels() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0005
    }
  })

  const positions = useMemo(() => {
    const result: [number, number, number][] = []
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 3; col++) {
        result.push([col * 3.2 - 3.2, -1.5, row * 2 - 1])
      }
    }
    return result
  }, [])

  return (
    <group ref={groupRef} rotation={[-Math.PI / 6, 0, 0]} position={[0, -0.5, 0]}>
      {positions.map((pos, i) => (
        <SolarPanel key={i} position={pos} />
      ))}
    </group>
  )
}

/* ============================================
   Scene composition
   ============================================ */

export default function SolarScene() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      <Canvas
        gl={{ alpha: true, antialias: true }}
        camera={{ position: [0, 2, 8], fov: 45 }}
        style={{ pointerEvents: "auto" }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={0.4} />
        <SolarPanels />
        <Bee />
      </Canvas>
    </div>
  )
}
