import { motion } from 'motion/react'
import { learningDurations } from '../shared/learningMotion'

interface WaveformProps {
  active?: boolean
  liveVolume?: number
}

const bars = [24, 38, 18, 52, 28, 66, 34, 58, 22, 44, 30, 70, 36, 20, 48, 62, 32, 54, 26, 42, 18, 36, 56, 30, 46, 24, 40, 60, 28, 50, 22, 38]

export function Waveform({ active = false, liveVolume = 0 }: WaveformProps) {
  const volumeMultiplier = active ? Math.max(0.75, Math.min(1.65, liveVolume / 45)) : 0.55

  return (
    <div
      className={`w-full max-w-2xl h-16 flex items-center justify-center gap-1.5 overflow-hidden transition-opacity duration-200 ${
        active ? 'opacity-95' : 'opacity-35'
      }`}
      style={{
        maskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
      }}
      aria-hidden="true"
    >
      {bars.map((baseHeight, index) => {
        const scale = active
          ? Math.max(0.3, Math.min(1.8, (baseHeight / 58) * volumeMultiplier))
          : Math.max(0.2, baseHeight / 100)

        return (
          <motion.span
            key={index}
            className={`w-1 rounded-full origin-center ${
              active
                ? index % 5 === 0
                  ? 'bg-study-accent'
                  : 'bg-study-primary'
                : 'bg-study-text-faint'
            }`}
            initial={false}
            animate={{ scaleY: scale }}
            transition={{ duration: learningDurations.micro, ease: 'easeOut' }}
            style={{ height: '72%' }}
          />
        )
      })}
    </div>
  )
}
