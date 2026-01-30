"use client"

import { cn } from "@/lib/utils"
import { useRef, useState } from "react"

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  glowColor?: "blue" | "emerald" | "purple" | "amber"
}

const glowColorMap = {
  blue: "from-blue-400/30 via-cyan-400/30 to-blue-400/30",
  emerald: "from-emerald-400/30 via-teal-400/30 to-emerald-400/30",
  purple: "from-violet-400/30 via-purple-400/30 to-violet-400/30",
  amber: "from-amber-400/30 via-orange-400/30 to-amber-400/30",
}

const spotlightColorMap = {
  blue: "rgba(59, 130, 246, 0.06)",
  emerald: "rgba(16, 185, 129, 0.06)",
  purple: "rgba(139, 92, 246, 0.06)",
  amber: "rgba(245, 158, 11, 0.06)",
}

export function GlassCard({ children, className, glowColor = "blue" }: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn("group relative", className)}
    >
      {/* Outer glow on hover */}
      <div
        className={cn(
          "absolute -inset-[1px] rounded-2xl bg-gradient-to-r opacity-0 blur-sm transition-all duration-500 group-hover:opacity-60",
          glowColorMap[glowColor]
        )}
      />

      {/* Card */}
      <div className="relative rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-xl overflow-hidden transition-all duration-300 group-hover:border-slate-300/80 group-hover:shadow-xl group-hover:shadow-slate-200/50">
        {/* Spotlight effect */}
        {isHovered && (
          <div
            className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
            style={{
              background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, ${spotlightColorMap[glowColor]}, transparent 40%)`,
            }}
          />
        )}

        {/* Content */}
        <div className="relative z-20">
          {children}
        </div>
      </div>
    </div>
  )
}

interface GlassCardHeaderProps {
  children: React.ReactNode
  className?: string
}

export function GlassCardHeader({ children, className }: GlassCardHeaderProps) {
  return (
    <div className={cn("border-b border-slate-100 bg-slate-50/50 p-6", className)}>
      {children}
    </div>
  )
}

interface GlassCardContentProps {
  children: React.ReactNode
  className?: string
}

export function GlassCardContent({ children, className }: GlassCardContentProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
    </div>
  )
}
