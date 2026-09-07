import { useCallback, useEffect, useRef, useState } from 'react'

export type AmbientMode = 'off' | 'cafe' | 'office' | 'rain'

export function useAmbientSound() {
  const [mode, setMode] = useState<AmbientMode>('off')
  const [volume, setVolume] = useState<number>(0.35)
  const audioContextRef = useRef<AudioContext | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null)

  // Initialize and build generative ambient noise buffers
  const createNoiseBuffer = (ctx: AudioContext, type: AmbientMode) => {
    const bufferSize = ctx.sampleRate * 3 // 3-second looping noise buffer
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const output = buffer.getChannelData(0)

    let lastOut = 0.0

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1

      if (type === 'cafe') {
        // Brown/pink noise with subtle low murmur frequencies
        lastOut = (lastOut + 0.03 * white) / 1.03
        output[i] = lastOut * 3.5
      } else if (type === 'rain') {
        // Pink noise with soft modulation
        lastOut = (lastOut + 0.08 * white) / 1.08
        output[i] = lastOut * 2.5
      } else {
        // Office: Very soft low pass hum
        lastOut = (lastOut + 0.02 * white) / 1.02
        output[i] = lastOut * 2.0
      }
    }
    return buffer
  }

  const stopAmbient = useCallback(() => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop()
        sourceNodeRef.current.disconnect()
      } catch {
        // Ignore
      }
      sourceNodeRef.current = null
    }
  }, [])

  const startAmbient = useCallback(
    (newMode: AmbientMode) => {
      stopAmbient()
      if (newMode === 'off') return

      try {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContextClass()
        }

        const ctx = audioContextRef.current
        if (ctx.state === 'suspended') {
          ctx.resume()
        }

        const buffer = createNoiseBuffer(ctx, newMode)
        const source = ctx.createBufferSource()
        source.buffer = buffer
        source.loop = true

        // Filter for organic warmth
        const filter = ctx.createBiquadFilter()
        if (newMode === 'cafe') {
          filter.type = 'lowpass'
          filter.frequency.value = 500
        } else if (newMode === 'rain') {
          filter.type = 'lowpass'
          filter.frequency.value = 900
        } else {
          // Office
          filter.type = 'lowpass'
          filter.frequency.value = 350
        }

        const gainNode = ctx.createGain()
        gainNode.gain.value = volume
        gainNodeRef.current = gainNode

        source.connect(filter)
        filter.connect(gainNode)
        gainNode.connect(ctx.destination)

        source.start()
        sourceNodeRef.current = source
      } catch (err) {
        console.warn('Web Audio ambient sound initialized with fallback', err)
      }
    },
    [stopAmbient, volume]
  )

  const toggleMode = (newMode: AmbientMode) => {
    setMode(newMode)
    startAmbient(newMode)
  }

  const changeVolume = (newVol: number) => {
    setVolume(newVol)
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = newVol
    }
  }

  useEffect(() => {
    return () => {
      stopAmbient()
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {})
      }
    }
  }, [stopAmbient])

  return {
    mode,
    volume,
    toggleMode,
    changeVolume,
  }
}
