import { LiveTranscriptionDisplay } from './LiveTranscriptionDisplay'
import { RecordButton } from './RecordButton'
import { Waveform } from './Waveform'

interface SpeakingStudioRecorderProps {
  isRecording: boolean
  isProcessing: boolean
  isComplete: boolean
  recordingTime: number
  liveVolume: number
  liveTranscript: string
  interimTranscript: string
  liveWpm: number
  usingRealMic: boolean
  targetOutline: string[]
  onStartRecording: () => void
  onStopRecording: () => void
  onResetRecording: () => void
}

export function SpeakingStudioRecorder({
  isRecording,
  isProcessing,
  isComplete,
  recordingTime,
  liveVolume,
  liveTranscript,
  interimTranscript,
  liveWpm,
  usingRealMic,
  targetOutline,
  onStartRecording,
  onStopRecording,
  onResetRecording,
}: SpeakingStudioRecorderProps) {
  return (
    <div className="bg-study-surface border border-study-border rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col items-center justify-center space-y-5 text-center relative overflow-hidden">
      {/* Visualizer Waveform */}
      <Waveform active={isRecording} liveVolume={liveVolume} />

      {/* Live Speech Recognition & Pacing Gauge */}
      <LiveTranscriptionDisplay
        transcript={liveTranscript}
        interimTranscript={interimTranscript}
        isRecording={isRecording}
        wpm={liveWpm}
        targetOutline={targetOutline}
      />

      {/* Tactile Record Button */}
      <RecordButton
        isRecording={isRecording}
        isProcessing={isProcessing}
        isComplete={isComplete}
        recordingTime={recordingTime}
        onStart={onStartRecording}
        onStop={onStopRecording}
        onReset={onResetRecording}
        usingRealMic={usingRealMic}
      />
    </div>
  )
}
