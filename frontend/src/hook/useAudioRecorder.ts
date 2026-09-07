import { useCallback, useEffect, useRef, useState } from 'react'

export interface AudioRecorderState {
  isRecording: boolean
  isProcessing: boolean
  isComplete: boolean
  recordingTime: number
  liveVolume: number
  audioUrl: string | null
  usingRealMic: boolean
  error: string | null
}

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [liveVolume, setLiveVolume] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [usingRealMic, setUsingRealMic] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const timerIntervalRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {})
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  // Volume sampling loop for real mic
  const sampleRealMicVolume = useCallback(() => {
    if (!analyserRef.current) return
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)

    // Calculate root mean square (RMS)
    let sum = 0
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i] * dataArray[i]
    }
    const rms = Math.sqrt(sum / dataArray.length)
    const normalized = Math.min(100, Math.round((rms / 128) * 100))
    setLiveVolume(normalized)

    animFrameRef.current = requestAnimationFrame(sampleRealMicVolume)
  }, [])

  // Volume sampling simulation fallback
  const sampleMockVolume = useCallback(() => {
    const time = Date.now() / 200
    // Generate organic undulating vocal speech pattern
    const wave = Math.sin(time) * 25 + Math.sin(time * 2.3) * 20 + Math.sin(time * 0.7) * 15 + 35
    const jitter = (Math.random() - 0.5) * 10
    setLiveVolume(Math.max(10, Math.min(95, Math.round(wave + jitter))))

    animFrameRef.current = requestAnimationFrame(sampleMockVolume)
  }, [])

  // Start recording
  const startRecording = useCallback(async () => {
    setError(null)
    setIsComplete(false)
    setRecordingTime(0)
    audioChunksRef.current = []

    // Start timer interval
    timerIntervalRef.current = window.setInterval(() => {
      setRecordingTime((prev) => prev + 1)
    }, 1000)

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        streamRef.current = stream
        setUsingRealMic(true)

        // Web Audio Analyser
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        const audioContext = new AudioContextClass()
        audioContextRef.current = audioContext
        const source = audioContext.createMediaStreamSource(stream)
        const analyser = audioContext.createAnalyser()
        analyser.fftSize = 64
        source.connect(analyser)
        analyserRef.current = analyser

        sampleRealMicVolume()

        // MediaRecorder
        const recorder = new MediaRecorder(stream)
        mediaRecorderRef.current = recorder

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data)
          }
        }

        recorder.onstop = () => {
          const mimeType = recorder.mimeType || 'audio/webm'
          const blob = new Blob(audioChunksRef.current, { type: mimeType })
          const url = URL.createObjectURL(blob)
          setAudioUrl(url)
        }

        recorder.start(100) // Collect in 100ms chunks
        setIsRecording(true)
        return
      }
    } catch {
      // Permission denied or no mic found -> Fallback to simulated recording seamlessly
      setUsingRealMic(false)
    }

    // Fallback mode
    sampleMockVolume()
    setIsRecording(true)
  }, [sampleRealMicVolume, sampleMockVolume])

  // Stop recording and process
  const stopRecording = useCallback(() => {
    if (!isRecording) return

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }

    setLiveVolume(0)
    setIsRecording(false)
    setIsProcessing(true)

    // Stop real recorder if active
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {})
      audioContextRef.current = null
    }

    // Simulate AI analysis latency (1.4s)
    setTimeout(() => {
      setIsProcessing(false)
      setIsComplete(true)
    }, 1400)
  }, [isRecording])

  // Reset to start over
  const resetRecording = useCallback(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    if (audioUrl) URL.revokeObjectURL(audioUrl)

    setIsRecording(false)
    setIsProcessing(false)
    setIsComplete(false)
    setRecordingTime(0)
    setLiveVolume(0)
    setAudioUrl(null)
    setError(null)
  }, [audioUrl])

  // Native Speech Synthesis (TTS for model answers and shadowing)
  const speakNative = useCallback((text: string, onEnd?: () => void) => {
    if (!('speechSynthesis' in window)) return

    window.speechSynthesis.cancel() // Cancel any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 0.92 // Slightly slower for crisp pedagogical shadowing
    utterance.pitch = 1.0

    // Try to pick natural US English voice if available
    const voices = window.speechSynthesis.getVoices()
    const usVoice = voices.find(
      (v) => (v.lang === 'en-US' || v.lang === 'en_US') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Karen'))
    ) ?? voices.find((v) => v.lang.startsWith('en'))

    if (usVoice) {
      utterance.voice = usVoice
    }

    if (onEnd) {
      utterance.onend = onEnd
      utterance.onerror = onEnd
    }

    window.speechSynthesis.speak(utterance)
  }, [])

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
  }, [])

  return {
    isRecording,
    isProcessing,
    isComplete,
    recordingTime,
    liveVolume,
    audioUrl,
    usingRealMic,
    error,
    startRecording,
    stopRecording,
    resetRecording,
    speakNative,
    stopSpeaking,
  }
}
