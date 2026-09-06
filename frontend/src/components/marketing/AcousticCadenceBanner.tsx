import { Check, Gauge, Headphones, Pause, Play, Sparkles, Volume2, Waves } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

interface RhythmPreset {
  id: string
  label: string
  title: string
  category: string
  tempo: string
  bpm: number
  pitchRange: string
  sentence: string
  words: Array<{ text: string; stress?: boolean; pause?: boolean; pitch: number }>
  insight: string
  soundFrequencies: number[] // Hz tones for synthetic melodic speech contour
}

const presets: RhythmPreset[] = [
  {
    id: 'standup',
    label: 'Scrum Standup',
    title: 'Báo cáo Daily Standup gãy gọn',
    category: 'Work & Tech',
    tempo: '115 WPM',
    bpm: 115,
    pitchRange: '145 – 190 Hz',
    sentence: 'Yesterday I wrapped up the auth API, and gained complete clarity on the contract.',
    words: [
      { text: 'Yesterday', pitch: 175 },
      { text: 'I', pitch: 150 },
      { text: 'wrapped up', stress: true, pitch: 195 },
      { text: 'the auth API,', pause: true, pitch: 180 },
      { text: 'and gained', pitch: 155 },
      { text: 'complete clarity', stress: true, pitch: 205 },
      { text: 'on the contract.', pause: true, pitch: 140 },
    ],
    insight: 'Nhấn mạnh vào động từ hành động "wrapped up" và "clarity", hạ tông ở cuối câu để tạo độ tin cậy dứt khoát.',
    soundFrequencies: [330, 294, 392, 349, 294, 440, 261],
  },
  {
    id: 'pitch',
    label: 'Executive Pitch',
    title: 'Góp ý thận trọng trong cuộc họp',
    category: 'Leadership',
    tempo: '98 WPM',
    bpm: 98,
    pitchRange: '130 – 175 Hz',
    sentence: 'From where I sit, launching next week might be counterproductive until QA signs off.',
    words: [
      { text: 'From where I sit,', stress: true, pause: true, pitch: 170 },
      { text: 'launching', pitch: 155 },
      { text: 'next week', pitch: 160 },
      { text: 'might be', pitch: 150 },
      { text: 'counterproductive', stress: true, pause: true, pitch: 185 },
      { text: 'until QA', pitch: 165 },
      { text: 'signs off.', stress: true, pause: true, pitch: 135 },
    ],
    insight: 'Tốc độ chậm hơn 15% so với bình thường, tạo khoảng lặng 0.4s sau "From where I sit" để đối phương tiếp nhận thông điệp.',
    soundFrequencies: [349, 311, 330, 294, 392, 330, 261],
  },
  {
    id: 'smalltalk',
    label: 'Casual Smalltalk',
    title: 'Mở lời trò chuyện đầu tuần',
    category: 'Social',
    tempo: '124 WPM',
    bpm: 124,
    pitchRange: '160 – 225 Hz',
    sentence: 'I laid low over the weekend to recharge—honestly just what I needed before a busy sprint.',
    words: [
      { text: 'I laid low', stress: true, pitch: 190 },
      { text: 'over the weekend', pitch: 170 },
      { text: 'to recharge—', stress: true, pause: true, pitch: 215 },
      { text: 'honestly', pitch: 180 },
      { text: 'just what I needed', stress: true, pause: true, pitch: 220 },
      { text: 'before a busy sprint.', pitch: 150 },
    ],
    insight: 'Tông giọng ấm áp, các điểm luyến âm nâng cao ở "recharge" và "needed" giúp câu nói tự nhiên, không bị cứng nhắc.',
    soundFrequencies: [392, 349, 440, 392, 466, 294],
  },
]

export function AcousticCadenceBanner() {
  const [activePresetIdx, setActivePresetIdx] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeWordIdx, setActiveWordIdx] = useState(-1)
  const [playbackSpeed, setPlaybackSpeed] = useState<0.8 | 1.0 | 1.2>(1.0)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const animTimeoutRef = useRef<number | null>(null)

  const preset = presets[activePresetIdx]

  // Play audio frequency sequence using Web Audio API
  const playAcousticCadence = () => {
    if (isPlaying) {
      stopPlayback()
      return
    }

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContextClass()
      }

      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume()
      }

      setIsPlaying(true)
      setActiveWordIdx(0)

      const ctx = audioCtxRef.current
      const freqs = preset.soundFrequencies
      const stepDuration = (480 / playbackSpeed) / 1000 // seconds per word step

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * stepDuration)

        // Soft envelope: attack & decay for pleasant human-like acoustic chime
        gain.gain.setValueAtTime(0.0001, ctx.currentTime + idx * stepDuration)
        gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + idx * stepDuration + 0.04)
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + (idx + 1) * stepDuration - 0.02)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(ctx.currentTime + idx * stepDuration)
        osc.stop(ctx.currentTime + (idx + 1) * stepDuration)
      })

      // Sync word-by-word visual highlight
      let currentIdx = 0
      const intervalMs = (480 / playbackSpeed)
      const timer = window.setInterval(() => {
        currentIdx += 1
        if (currentIdx < preset.words.length) {
          setActiveWordIdx(currentIdx)
        } else {
          window.clearInterval(timer)
          setIsPlaying(false)
          setActiveWordIdx(-1)
        }
      }, intervalMs)

      animTimeoutRef.current = timer
    } catch {
      // Fallback if audio blocked
      setIsPlaying(false)
      setActiveWordIdx(-1)
    }
  }

  const stopPlayback = () => {
    if (animTimeoutRef.current) {
      window.clearInterval(animTimeoutRef.current)
    }
    setIsPlaying(false)
    setActiveWordIdx(-1)
  }

  useEffect(() => {
    return () => {
      if (animTimeoutRef.current) window.clearInterval(animTimeoutRef.current)
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close()
      }
    }
  }, [])

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-study-surface via-study-surface to-study-primary-soft/30 border border-study-primary-border/60 p-6 sm:p-10 shadow-sm space-y-8">
      {/* Top Banner Tag & Live Signal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-wider uppercase text-study-primary">
            <Waves size={14} className="animate-pulse" />
            <span>INTERACTIVE ACOUSTIC LAB · CADENCE SIMULATOR</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-display font-bold text-study-text">
            Thử nghiệm trực tiếp: Nhịp điệu và Cao độ tự nhiên
          </h3>
        </div>

        {/* Speed Switcher */}
        <div className="flex items-center gap-2 bg-study-surface-muted/70 p-1 rounded-xl border border-study-border self-start sm:self-auto text-xs">
          <Gauge size={13} className="text-study-text-muted ml-1.5" />
          <span className="text-[11px] text-study-text-muted mr-1">Tốc độ:</span>
          {([0.8, 1.0, 1.2] as const).map((spd) => (
            <button
              key={spd}
              type="button"
              onClick={() => {
                stopPlayback()
                setPlaybackSpeed(spd)
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                playbackSpeed === spd
                  ? 'bg-study-primary text-white shadow-xs'
                  : 'text-study-text-muted hover:text-study-text'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>

      {/* Preset Pill Selector */}
      <div className="flex flex-wrap gap-2">
        {presets.map((item, idx) => {
          const isActive = activePresetIdx === idx
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                stopPlayback()
                setActivePresetIdx(idx)
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 border ${
                isActive
                  ? 'bg-study-primary text-white border-study-primary shadow-xs'
                  : 'bg-study-surface hover:bg-study-surface-hover border-study-border text-study-text-muted hover:text-study-text'
              }`}
            >
              <span>{item.label}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isActive ? 'bg-white/20 text-white' : 'bg-study-surface-muted text-study-text-muted'}`}>
                {item.tempo}
              </span>
            </button>
          )
        })}
      </div>

      {/* Interactive Sentence Audio Display */}
      <div className="p-6 rounded-2xl bg-study-surface/90 border border-study-border space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-study-border pb-3">
          <span className="font-semibold text-study-text flex items-center gap-1.5">
            <Sparkles size={13} className="text-study-primary" />
            {preset.title}
          </span>

          <div className="flex items-center gap-4 text-[11px] font-mono text-study-text-muted">
            <span>Dải cao độ: <strong className="text-study-text">{preset.pitchRange}</strong></span>
            <span>·</span>
            <span>Nhịp: <strong className="text-study-primary">{preset.bpm} BPM</strong></span>
          </div>
        </div>

        {/* Word Syllable Flow */}
        <div className="text-base sm:text-xl font-display text-study-text leading-relaxed flex flex-wrap items-center gap-2 py-2">
          {preset.words.map((w, idx) => {
            const isWordActive = activeWordIdx === idx
            return (
              <span
                key={idx}
                className={`transition-all duration-200 px-2 py-1 rounded-lg flex items-center ${
                  isWordActive
                    ? 'bg-study-primary text-white scale-105 shadow-sm font-bold'
                    : w.stress
                    ? 'text-study-primary font-bold bg-study-primary-soft/40 border border-study-primary-border/30'
                    : 'text-study-text hover:bg-study-surface-muted/60'
                }`}
              >
                <span>{w.text}</span>
                {w.pause && (
                  <span className="ml-1.5 px-1 py-0.2 rounded text-[10px] font-mono text-study-text-muted bg-study-surface-muted border border-study-border font-normal">
                    0.3s ⏸
                  </span>
                )}
              </span>
            )
          })}
        </div>

        {/* Playback Controls & Waveform Animation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={playAcousticCadence}
              className="w-12 h-12 rounded-2xl bg-study-primary text-white flex items-center justify-center hover:bg-study-primary-hover active:scale-95 transition-all shadow-sm cursor-pointer shrink-0"
              aria-label={isPlaying ? 'Dừng' : 'Phát nhịp điệu mẫu'}
            >
              {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
            </button>

            <div>
              <strong className="block text-xs font-semibold text-study-text">
                {isPlaying ? 'Đang phát âm hưởng ngữ điệu...' : 'Bấm để nghe nhịp điệu âm hưởng (Acoustic Tone)'}
              </strong>
              <span className="text-[11px] text-study-text-muted">
                {isPlaying ? 'Theo dõi từng từ phát sáng khớp với cao độ' : 'Tạo âm thanh mô phỏng cao độ người bản xứ'}
              </span>
            </div>
          </div>

          {/* Dynamic Equalizer Waveform Bars */}
          <div className="flex items-center gap-1.5 h-9 bg-study-surface-muted/70 px-3 py-1.5 rounded-xl border border-study-border">
            {[35, 70, 95, 50, 100, 75, 60, 85, 100, 65, 45, 80, 95, 60, 40].map((val, i) => (
              <span
                key={i}
                style={{
                  height: isPlaying ? `${val}%` : '20%',
                  animationDuration: isPlaying ? `${0.45 + (i % 6) * 0.1}s` : undefined,
                  animationDelay: isPlaying ? `${(i * 0.06)}s` : undefined,
                }}
                className={`w-1.5 rounded-full transition-all duration-150 ${
                  isPlaying ? 'bg-teal-600 dark:bg-teal-400 animate-waveform shadow-[0_0_10px_rgba(13,148,136,0.4)]' : 'bg-study-text-faint/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Linguistic Insight Note */}
        <div className="p-3.5 rounded-xl bg-study-primary-soft/30 border border-study-primary-border/40 text-xs text-study-text flex items-start gap-2.5">
          <Check size={14} className="text-study-primary shrink-0 mt-0.5" strokeWidth={2.5} />
          <span>
            <strong className="text-study-primary">Phân tích âm học:</strong> {preset.insight}
          </span>
        </div>
      </div>

      {/* Bottom Sub-CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-study-text-muted pt-2 border-t border-study-border/60">
        <span className="flex items-center gap-2">
          <Headphones size={14} className="text-study-primary" />
          <span>Được tinh chỉnh dựa trên nghiên cứu ngữ điệu tiếng Anh hội thoại thực tế</span>
        </span>

        <Link
          to="/speaking-method"
          className="font-semibold text-study-primary hover:text-study-primary-hover hover:underline transition-colors"
        >
          Tìm hiểu phương pháp Shadowing đầy đủ →
        </Link>
      </div>
    </div>
  )
}
