import { Activity, Disc, Flame, Mic2, Sparkles, Volume2, Waves } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export function AcousticWaveVisualizer() {
  const [isHovered, setIsHovered] = useState(false)
  const [pulsePhase, setPulsePhase] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setPulsePhase((prev) => (prev + 1) % 100)
    }, 50)
    return () => clearInterval(timer)
  }, [])

  // Calculate harmonic dynamic path coordinates for 3 fluid sine waves
  const generateSineWavePath = (amplitude: number, frequency: number, phaseShift: number, yOffset: number) => {
    const points: string[] = []
    const width = 500
    const steps = 40
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * width
      const rad = ((i / steps) * Math.PI * 2 * frequency) + (pulsePhase * 0.08) + phaseShift
      const y = yOffset + Math.sin(rad) * amplitude * (isHovered ? 1.4 : 1.0)
      points.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`)
    }
    return points.join(' ')
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full max-w-2xl mx-auto my-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-study-surface via-study-surface to-study-primary/5 border border-study-primary/20 shadow-sm overflow-hidden select-none transition-all duration-300 hover:border-study-primary/40 hover:shadow-lg"
    >
      {/* Ambient Teal Glowing Core */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-40 bg-study-primary/8 rounded-full blur-3xl pointer-events-none animate-aurora" />

      {/* Header Info */}
      <div className="relative z-10 flex items-center justify-between gap-3 text-xs mb-4">
        <div className="flex items-center gap-2 text-study-primary font-semibold">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-study-primary opacity-60" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-study-primary" />
          </span>
          <span className="font-mono uppercase tracking-wider text-[11px]">ACOUSTIC CADENCE RADAR</span>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-mono text-study-text-muted bg-study-surface-muted/60 px-2.5 py-1 rounded-full border border-study-border">
          <Activity size={12} className="text-study-primary" />
          <span>{isHovered ? 'RESONANCE: BOOSTED' : 'FREQUENCY: 165 HZ'}</span>
        </div>
      </div>

      {/* Fluid Dynamic Waveform SVG */}
      <div className="relative h-28 w-full flex items-center justify-center">
        <svg
          viewBox="0 0 500 120"
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Wave Gradient 1: Pacific Teal Primary */}
            <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.15" />
              <stop offset="50%" stopColor="var(--primary)" stopOpacity="0.85" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.25" />
            </linearGradient>

            {/* Wave Gradient 2: Soft Emerald */}
            <linearGradient id="waveGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.1" />
              <stop offset="50%" stopColor="var(--primary)" stopOpacity="0.65" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.15" />
            </linearGradient>

            {/* Wave Gradient 3: Ethereal Teal Glow */}
            <linearGradient id="waveGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.08" />
              <stop offset="50%" stopColor="var(--primary)" stopOpacity="0.6" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.15" />
            </linearGradient>
          </defs>

          {/* Wave Layer 3 (Background subtle) */}
          <path
            d={generateSineWavePath(16, 2.2, Math.PI / 3, 60)}
            fill="none"
            stroke="url(#waveGrad3)"
            strokeWidth="1.8"
            strokeDasharray="4 4"
            className="transition-all duration-150"
          />

          {/* Wave Layer 2 (Mid harmonic) */}
          <path
            d={generateSineWavePath(22, 1.6, Math.PI / 2, 60)}
            fill="none"
            stroke="url(#waveGrad2)"
            strokeWidth="2.4"
            className="transition-all duration-150"
          />

          {/* Wave Layer 1 (Primary Dominant Resonance) */}
          <path
            d={generateSineWavePath(28, 1.2, 0, 60)}
            fill="none"
            stroke="url(#waveGrad1)"
            strokeWidth="3.2"
            strokeLinecap="round"
            className="transition-all duration-150"
          />

          {/* Dynamic Floating Nodes along the wave */}
          <circle
            cx="140"
            cy={(60 + Math.sin((140 / 500) * Math.PI * 2 * 1.2 + (pulsePhase * 0.08)) * 28 * (isHovered ? 1.4 : 1.0)).toFixed(1)}
            r="4.5"
            className="fill-study-primary animate-pulse"
          />
          <circle
            cx="280"
            cy={(60 + Math.sin((280 / 500) * Math.PI * 2 * 1.2 + (pulsePhase * 0.08)) * 28 * (isHovered ? 1.4 : 1.0)).toFixed(1)}
            r="5"
            className="fill-sky-500 dark:fill-sky-400 animate-pulse"
          />
          <circle
            cx="410"
            cy={(60 + Math.sin((410 / 500) * Math.PI * 2 * 1.2 + (pulsePhase * 0.08)) * 28 * (isHovered ? 1.4 : 1.0)).toFixed(1)}
            r="4"
            className="fill-study-primary animate-pulse"
          />
        </svg>
      </div>

      {/* Dynamic Voice Rhythm Badges Floating Beneath */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-study-border/60 text-xs">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-study-primary/10 text-study-primary font-mono text-[11px] font-bold border border-study-primary/15">
            Cadence Flow
          </span>
          <span className="text-study-text-muted text-[11px]">
            Tự động bù trừ khoảng ngắt hơi tự nhiên
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-study-text-muted">
          <span className="w-1.5 h-1.5 rounded-full bg-study-primary" />
          <span>Di chuột để khuếch đại biên độ</span>
        </div>
      </div>
    </div>
  )
}
