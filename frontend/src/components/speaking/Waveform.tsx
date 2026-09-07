interface WaveformProps {
  active?: boolean
  liveVolume?: number
}

export function Waveform({ active = false, liveVolume = 0 }: { active?: boolean; liveVolume?: number }) {
  const bars = [
    20, 32, 16, 45, 28, 56, 31, 68, 42, 27, 50, 34, 72, 38, 21, 47, 63, 30, 54, 26, 41, 18, 33,
    58, 29, 48, 36, 20, 44, 62, 30, 50, 24, 37, 54, 31, 20, 43, 60, 27, 45, 23, 35, 50, 28, 18,
    39, 54, 26, 44, 30, 19, 35, 47, 25, 40, 22, 33, 51, 29, 18, 38, 56, 24, 45, 31, 20, 40, 53,
    27, 42, 19, 36, 50, 30, 22, 43, 59, 26, 40, 20, 32, 48, 29, 18, 37, 55, 23, 44, 30, 18, 35,
    50, 26, 42, 19, 34, 48, 29, 21, 39, 52, 28, 44, 24, 36, 48, 26, 40, 21, 31, 45, 25, 38, 20,
    33, 46, 28, 41, 22, 36, 49, 26, 40, 21, 34, 47, 29, 18, 38, 52, 25, 41, 19, 33, 45, 27, 39,
  ]

  // Volume factor between 0.6 and 1.5
  const volumeMultiplier = active ? Math.max(0.6, Math.min(1.6, liveVolume / 50)) : 0.4

  return (
    <div
      className={`w-full h-16 flex items-center justify-center gap-1 overflow-hidden transition-opacity duration-300 ${
        active ? 'opacity-95' : 'opacity-25'
      }`}
      style={{
        maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
      }}
      aria-hidden="true"
    >
      {bars.map((baseHeight, index) => {
        const computedHeight = active
          ? Math.max(8, Math.min(100, Math.round(baseHeight * volumeMultiplier)))
          : baseHeight * 0.4

        return (
          <span
            key={index}
            className={`w-[2.5px] rounded-full transition-all duration-100 ${
              active
                ? index % 4 === 0
                  ? 'bg-study-accent'
                  : 'bg-study-primary'
                : 'bg-study-text-faint'
            }`}
            style={{
              height: `${computedHeight}%`,
              minHeight: '4px',
            }}
          />
        )
      })}
    </div>
  )
}
