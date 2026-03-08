"use client"

import { useEffect, useRef } from "react"

/* ─── Animated city skyline with renewable energy (line-art style like Audax) ─── */
export function CityIllustration({ className }: { className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    async function animate() {
      const { gsap } = await import("gsap")
      const svg = svgRef.current
      if (!svg) return

      // Wind turbine blades rotation
      svg.querySelectorAll(".blade-group").forEach((el) => {
        gsap.to(el, { rotation: 360, transformOrigin: "center center", duration: 8, repeat: -1, ease: "none" })
      })

      // Subtle float on buildings
      svg.querySelectorAll(".float-el").forEach((el, i) => {
        gsap.to(el, { y: -3 + (i % 3), duration: 2 + i * 0.3, repeat: -1, yoyo: true, ease: "sine.inOut" })
      })

      // Sun rays pulse
      gsap.to(svg.querySelector(".sun-rays"), {
        opacity: 0.3, scale: 1.1, transformOrigin: "center center",
        duration: 2, repeat: -1, yoyo: true, ease: "sine.inOut",
      })

      // Power lines electric pulse
      svg.querySelectorAll(".pulse-dot").forEach((el, i) => {
        gsap.to(el, {
          attr: { cx: "+=80" }, duration: 1.5, repeat: -1, delay: i * 0.4, ease: "none",
          modifiers: { cx: (x: string) => parseFloat(x) % 300 + "" },
        })
      })
    }
    animate()
  }, [])

  return (
    <svg ref={svgRef} className={className} viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Sun */}
      <circle cx="650" cy="60" r="30" stroke="#FEC800" strokeWidth="1.5" fill="none" />
      <g className="sun-rays" opacity="0.5">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <line
            key={angle}
            x1="650" y1="60"
            x2={650 + Math.cos(angle * Math.PI / 180) * 50}
            y2={60 + Math.sin(angle * Math.PI / 180) * 50}
            stroke="#FEC800" strokeWidth="0.8" strokeDasharray="4 4"
          />
        ))}
      </g>

      {/* Hills */}
      <path d="M0 350 Q200 280 400 320 Q600 360 800 300 L800 400 L0 400 Z" stroke="#18191A" strokeWidth="1" fill="none" className="float-el" />

      {/* Wind turbine 1 */}
      <g className="float-el">
        <line x1="580" y1="180" x2="580" y2="320" stroke="#18191A" strokeWidth="1.5" />
        <g className="blade-group" style={{ transformOrigin: "580px 180px" }}>
          <line x1="580" y1="180" x2="580" y2="130" stroke="#18191A" strokeWidth="1.2" />
          <line x1="580" y1="180" x2="623" y2="205" stroke="#18191A" strokeWidth="1.2" />
          <line x1="580" y1="180" x2="537" y2="205" stroke="#18191A" strokeWidth="1.2" />
        </g>
        <circle cx="580" cy="180" r="3" fill="#18191A" />
      </g>

      {/* Wind turbine 2 */}
      <g className="float-el">
        <line x1="650" y1="200" x2="650" y2="310" stroke="#18191A" strokeWidth="1.5" />
        <g className="blade-group" style={{ transformOrigin: "650px 200px" }}>
          <line x1="650" y1="200" x2="650" y2="155" stroke="#18191A" strokeWidth="1.2" />
          <line x1="650" y1="200" x2="689" y2="223" stroke="#18191A" strokeWidth="1.2" />
          <line x1="650" y1="200" x2="611" y2="223" stroke="#18191A" strokeWidth="1.2" />
        </g>
        <circle cx="650" cy="200" r="3" fill="#18191A" />
      </g>

      {/* Solar panels */}
      <g className="float-el">
        <path d="M100 330 L130 315 L200 315 L170 330 Z" stroke="#18191A" strokeWidth="1" fill="none" />
        <line x1="130" y1="315" x2="143" y2="322" stroke="#18191A" strokeWidth="0.8" />
        <line x1="153" y1="315" x2="150" y2="325" stroke="#18191A" strokeWidth="0.8" />
        <line x1="176" y1="315" x2="157" y2="328" stroke="#18191A" strokeWidth="0.8" />
      </g>
      <g className="float-el">
        <path d="M210 335 L240 320 L310 320 L280 335 Z" stroke="#18191A" strokeWidth="1" fill="none" />
        <line x1="240" y1="320" x2="253" y2="327" stroke="#18191A" strokeWidth="0.8" />
        <line x1="263" y1="320" x2="260" y2="330" stroke="#18191A" strokeWidth="0.8" />
        <line x1="286" y1="320" x2="267" y2="333" stroke="#18191A" strokeWidth="0.8" />
      </g>

      {/* House */}
      <g className="float-el">
        <path d="M400 290 L430 265 L460 290 L460 330 L400 330 Z" stroke="#18191A" strokeWidth="1.2" fill="none" />
        <rect x="420" y="305" width="15" height="25" stroke="#18191A" strokeWidth="0.8" fill="none" />
        <path d="M408 290 L430 260 L452 290" stroke="#18191A" strokeWidth="1" fill="none" />
      </g>

      {/* Power lines */}
      <path d="M0 250 Q200 230 400 250 Q600 270 800 240" stroke="#18191A" strokeWidth="0.6" strokeDasharray="none" opacity="0.3" />
      <circle className="pulse-dot" cx="100" cy="245" r="2" fill="#FEC800" />
      <circle className="pulse-dot" cx="300" cy="248" r="2" fill="#FEC800" />

      {/* Small trees */}
      {[320, 500, 720].map((x) => (
        <g key={x} className="float-el">
          <line x1={x} y1={335} x2={x} y2={350} stroke="#18191A" strokeWidth="1" />
          <circle cx={x} cy={330} r="8" stroke="#18191A" strokeWidth="0.8" fill="none" />
        </g>
      ))}
    </svg>
  )
}

/* ─── Simple flow diagram (line-art) ─── */
export function FlowIllustration({ className }: { className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    async function animate() {
      const { gsap } = await import("gsap")
      const svg = svgRef.current
      if (!svg) return

      // Animate the flow dots along the path
      svg.querySelectorAll(".flow-dot").forEach((el, i) => {
        gsap.to(el, {
          motionPath: { path: "#flowpath", align: "#flowpath", autoRotate: false },
          duration: 4, repeat: -1, delay: i * 1.3, ease: "none",
        })
      })

      // Pulse icons
      svg.querySelectorAll(".icon-pulse").forEach((el, i) => {
        gsap.to(el, {
          scale: 1.05, transformOrigin: "center center",
          duration: 1.5, repeat: -1, yoyo: true, delay: i * 0.5, ease: "sine.inOut",
        })
      })
    }
    animate()
  }, [])

  return (
    <svg ref={svgRef} className={className} viewBox="0 0 800 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Flow path */}
      <path id="flowpath" d="M100 100 C200 100 200 100 300 100 C400 100 400 100 500 100 C600 100 600 100 700 100" stroke="#E5E7EB" strokeWidth="2" fill="none" />

      {/* Flow dots */}
      <circle className="flow-dot" r="4" fill="#FEC800" />
      <circle className="flow-dot" r="4" fill="#3DDC97" />
      <circle className="flow-dot" r="4" fill="#FA9A4B" />

      {/* Step 1: Sun + Panel */}
      <g className="icon-pulse">
        <circle cx="100" cy="100" r="35" stroke="#FEC800" strokeWidth="1.5" fill="none" />
        <circle cx="100" cy="90" r="10" stroke="#FEC800" strokeWidth="1" fill="none" />
        <path d="M85 110 L115 110 L110 105 L90 105 Z" stroke="#FEC800" strokeWidth="1" fill="none" />
      </g>
      <text x="100" y="160" textAnchor="middle" fontSize="12" fill="#505050" fontFamily="Inter">Generación</text>

      {/* Step 2: Document */}
      <g className="icon-pulse">
        <circle cx="300" cy="100" r="35" stroke="#3DDC97" strokeWidth="1.5" fill="none" />
        <rect x="285" y="83" width="30" height="35" rx="2" stroke="#3DDC97" strokeWidth="1" fill="none" />
        <line x1="291" y1="93" x2="309" y2="93" stroke="#3DDC97" strokeWidth="0.8" />
        <line x1="291" y1="100" x2="309" y2="100" stroke="#3DDC97" strokeWidth="0.8" />
        <line x1="291" y1="107" x2="303" y2="107" stroke="#3DDC97" strokeWidth="0.8" />
      </g>
      <text x="300" y="160" textAnchor="middle" fontSize="12" fill="#505050" fontFamily="Inter">Certificado</text>

      {/* Step 3: Check/Verify */}
      <g className="icon-pulse">
        <circle cx="500" cy="100" r="35" stroke="#FA9A4B" strokeWidth="1.5" fill="none" />
        <path d="M487 100 L497 110 L515 90" stroke="#FA9A4B" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <text x="500" y="160" textAnchor="middle" fontSize="12" fill="#505050" fontFamily="Inter">Verificación</text>

      {/* Step 4: Globe */}
      <g className="icon-pulse">
        <circle cx="700" cy="100" r="35" stroke="#C590FC" strokeWidth="1.5" fill="none" />
        <circle cx="700" cy="100" r="15" stroke="#C590FC" strokeWidth="1" fill="none" />
        <ellipse cx="700" cy="100" rx="7" ry="15" stroke="#C590FC" strokeWidth="0.8" fill="none" />
        <line x1="685" y1="100" x2="715" y2="100" stroke="#C590FC" strokeWidth="0.8" />
      </g>
      <text x="700" y="160" textAnchor="middle" fontSize="12" fill="#505050" fontFamily="Inter">Impacto</text>
    </svg>
  )
}
