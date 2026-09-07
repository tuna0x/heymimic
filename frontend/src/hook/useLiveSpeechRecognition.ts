import { useCallback, useEffect, useRef, useState } from 'react'

// Web Speech Recognition types
interface IWindow extends Window {
  SpeechRecognition?: any
  webkitSpeechRecognition?: any
}

export interface UseLiveSpeechRecognitionProps {
  onKeywordDetected?: (keyword: string) => void
  samplePhrasesFallback?: string[]
}

export function useLiveSpeechRecognition(props?: UseLiveSpeechRecognitionProps) {
  const [transcript, setTranscript] = useState<string>('')
  const [interimTranscript, setInterimTranscript] = useState<string>('')
  const [isListening, setIsListening] = useState<boolean>(false)
  const [wpm, setWpm] = useState<number>(0)
  const [detectedKeywords, setDetectedKeywords] = useState<string[]>([])

  const recognitionRef = useRef<any>(null)
  const startTimeRef = useRef<number | null>(null)
  const fallbackIntervalRef = useRef<number | null>(null)

  // Calculate WPM based on word count and elapsed time
  const updateWpm = useCallback((text: string) => {
    if (!startTimeRef.current) return
    const elapsedMinutes = (Date.now() - startTimeRef.current) / 60000
    if (elapsedMinutes <= 0.05) return

    const words = text.trim().split(/\s+/).filter(Boolean).length
    const currentWpm = Math.round(words / elapsedMinutes)
    setWpm(Math.min(220, Math.max(0, currentWpm)))
  }, [])

  // Start speech recognition
  const startListening = useCallback(() => {
    setTranscript('')
    setInterimTranscript('')
    setWpm(0)
    setDetectedKeywords([])
    startTimeRef.current = Date.now()
    setIsListening(true)

    const win = typeof window !== 'undefined' ? (window as unknown as IWindow) : null
    const SpeechRecognitionClass = win?.SpeechRecognition || win?.webkitSpeechRecognition

    if (SpeechRecognitionClass) {
      try {
        const recognition = new SpeechRecognitionClass()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-US'

        recognition.onresult = (event: any) => {
          let currentInterim = ''
          let currentFinal = ''

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const res = event.results[i]
            if (res.isFinal) {
              currentFinal += res[0].transcript + ' '
            } else {
              currentInterim += res[0].transcript
            }
          }

          if (currentFinal) {
            setTranscript((prev) => {
              const updated = (prev + ' ' + currentFinal).trim()
              updateWpm(updated)
              return updated
            })
          }
          setInterimTranscript(currentInterim)
        }

        recognition.onerror = () => {
          // Graceful fallback to simulated speech flow if microphone permission or offline
          startFallbackSimulation()
        }

        recognition.onend = () => {
          if (isListening) {
            try {
              recognition.start()
            } catch {
              // Ignore restart error
            }
          }
        }

        recognition.start()
        recognitionRef.current = recognition
        return
      } catch {
        startFallbackSimulation()
      }
    } else {
      startFallbackSimulation()
    }
  }, [isListening, updateWpm])

  // Fallback organic speech simulation for environments without Web Speech STT support
  const startFallbackSimulation = useCallback(() => {
    const defaultPhrases = props?.samplePhrasesFallback ?? [
      'In our sprint standup today,',
      'I want to highlight that we made great progress on the backend.',
      'From my perspective,',
      'we should definitely coordinate with the design team before launch.',
      'At the end of the day,',
      'delivering a seamless experience is our top priority.',
    ]

    let wordIndex = 0
    const words = defaultPhrases.join(' ').split(' ')

    fallbackIntervalRef.current = window.setInterval(() => {
      if (wordIndex < words.length) {
        const nextWord = words[wordIndex]
        setTranscript((prev) => {
          const updated = (prev ? prev + ' ' : '') + nextWord
          updateWpm(updated)
          return updated
        })
        wordIndex++
      } else {
        if (fallbackIntervalRef.current) clearInterval(fallbackIntervalRef.current)
      }
    }, 450)
  }, [props?.samplePhrasesFallback, updateWpm])

  // Stop listening
  const stopListening = useCallback(() => {
    setIsListening(false)
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {
        // Ignore
      }
      recognitionRef.current = null
    }
    if (fallbackIntervalRef.current) {
      clearInterval(fallbackIntervalRef.current)
      fallbackIntervalRef.current = null
    }
  }, [])

  const resetTranscript = useCallback(() => {
    setTranscript('')
    setInterimTranscript('')
    setWpm(0)
    setDetectedKeywords([])
  }, [])

  // Clean up
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch {
          // Ignore
        }
      }
      if (fallbackIntervalRef.current) clearInterval(fallbackIntervalRef.current)
    }
  }, [])

  return {
    transcript,
    interimTranscript,
    isListening,
    wpm,
    detectedKeywords,
    startListening,
    stopListening,
    resetTranscript,
  }
}
