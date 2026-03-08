"use client"

import { useEffect, useRef } from "react"

export default function BeeCursor() {
  const beeRef = useRef<HTMLImageElement>(null)
  const pos = useRef({ x: 0, y: 0 })
  const target = useRef({ x: 0, y: 0 })
  const velocity = useRef({ x: 0 })
  const raf = useRef<number>(0)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      target.current.x = e.clientX
      target.current.y = e.clientY
    }
    window.addEventListener("mousemove", handleMouseMove)

    const animate = () => {
      const bee = beeRef.current
      if (!bee) { raf.current = requestAnimationFrame(animate); return }

      const prevX = pos.current.x
      pos.current.x += (target.current.x - pos.current.x) * 0.08
      pos.current.y += (target.current.y - pos.current.y) * 0.08
      velocity.current.x = pos.current.x - prevX

      // Flip bee based on direction
      const scaleX = velocity.current.x < -0.5 ? -1 : 1
      const tilt = Math.max(-15, Math.min(15, velocity.current.x * 3))

      bee.style.transform = `translate(${pos.current.x - 30}px, ${pos.current.y - 30}px) scaleX(${scaleX}) rotate(${tilt}deg)`

      raf.current = requestAnimationFrame(animate)
    }

    // Init position off-screen
    pos.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    target.current = { ...pos.current }
    raf.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      cancelAnimationFrame(raf.current)
    }
  }, [])

  return (
    <img
      ref={beeRef}
      src="/beenergy-assets/iso-transparente.png"
      alt=""
      className="fixed top-0 left-0 z-40 pointer-events-none hidden md:block"
      style={{ width: 60, height: 60, willChange: "transform" }}
      draggable={false}
    />
  )
}
