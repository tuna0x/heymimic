import { useState } from 'react'
import { Building2, Coffee, CloudRain, Volume2, VolumeX } from 'lucide-react'
import type { AmbientMode } from '../../hook/useAmbientSound'

interface AmbientSoundSelectorProps {
  mode: AmbientMode
  volume: number
  onToggleMode: (mode: AmbientMode) => void
  onChangeVolume: (volume: number) => void
}

export function AmbientSoundSelector({
  mode,
  volume,
  onToggleMode,
  onChangeVolume,
}: AmbientSoundSelectorProps) {
  const [showVolume, setShowVolume] = useState(false)

  const atmospheres: { id: AmbientMode; label: string; icon: any }[] = [
    { id: 'off', label: 'Yên tĩnh', icon: VolumeX },
    { id: 'cafe', label: 'Quán Café', icon: Coffee },
    { id: 'office', label: 'Văn phòng', icon: Building2 },
    { id: 'rain', label: 'Mưa nhẹ', icon: CloudRain },
  ]

  return (
    <div className="inline-flex items-center gap-2 p-1.5 rounded-2xl bg-study-surface border border-study-border shadow-xs text-xs">
      <span className="text-[11px] font-medium text-study-text-muted px-1.5 hidden sm:inline">
        Không gian:
      </span>

      <div className="flex items-center gap-1">
        {atmospheres.map((atm) => {
          const Icon = atm.icon
          const isActive = mode === atm.id
          return (
            <button
              key={atm.id}
              type="button"
              onClick={() => onToggleMode(atm.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-study-primary text-white shadow-xs'
                  : 'text-study-text-muted hover:text-study-text hover:bg-study-surface-hover'
              }`}
              title={`Bật không gian ${atm.label}`}
            >
              <Icon size={13} />
              <span className="text-[11px]">{atm.label}</span>
            </button>
          )
        })}
      </div>

      {mode !== 'off' && (
        <div className="flex items-center gap-1.5 pl-1.5 border-l border-study-border/60">
          <input
            type="range"
            min={0.05}
            max={0.8}
            step={0.05}
            value={volume}
            onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
            className="w-16 h-1.5 bg-study-border rounded-lg appearance-none cursor-pointer accent-study-primary"
            title="Âm lượng không gian nền"
          />
        </div>
      )}
    </div>
  )
}
