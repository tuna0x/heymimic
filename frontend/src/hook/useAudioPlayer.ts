import { useState, useEffect, useRef } from 'react'

export interface AudioScenario {
  id: string
  tag: string
  title: string
  vietnameseTitle: string
  prompt: string
  sampleTranscript: string
  originalPhrase: string
  improvedPhrase: string
  feedbackNote: string
  fluencyScore: number
  pronunciationScore: number
  audioDuration: string
}

export function useAudioPlayer(scenarios: AudioScenario[]) {
  const [activeScenarioIndex, setActiveScenarioIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progressSeconds, setProgressSeconds] = useState(0)
  const timerRef = useRef<number | null>(null)

  const activeScenario = scenarios[activeScenarioIndex] || scenarios[0]

  const togglePlay = () => {
    setIsPlaying((prev) => !prev)
  }

  const selectScenario = (index: number) => {
    setActiveScenarioIndex(index)
    setIsPlaying(false)
    setProgressSeconds(0)
  }

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setProgressSeconds((sec) => {
          if (sec >= 14) {
            setIsPlaying(false)
            return 0
          }
          return sec + 1
        })
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPlaying])

  const formattedTime = `00:${progressSeconds < 10 ? `0${progressSeconds}` : progressSeconds}`

  return {
    activeScenario,
    activeScenarioIndex,
    isPlaying,
    progressSeconds,
    formattedTime,
    togglePlay,
    selectScenario,
  }
}
