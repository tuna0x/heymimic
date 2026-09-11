import { motion } from 'motion/react'
import { LiveTranscriptionDisplay } from './LiveTranscriptionDisplay'
import { RecordButton } from './RecordButton'
import { Waveform } from './Waveform'
import { learningFadeUp } from '../shared/learningMotion'

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
  startDisabled: boolean
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
  startDisabled,
  targetOutline,
  onStartRecording,
  onStopRecording,
  onResetRecording,
}: SpeakingStudioRecorderProps) {
  return (
    <motion.div
      {...learningFadeUp}
      className="learning-surface relative flex flex-col items-center justify-center space-y-5 overflow-hidden p-6 text-center sm:p-8"
    >
      <div className="flex w-full items-center justify-between text-[11px] font-semibold uppercase tracking-[0.16em] text-study-text-muted">
        <span>{isRecording ? 'Đang thu âm' : isComplete ? 'Đã hoàn tất' : 'Sẵn sàng luyện'}</span>
        <span className="font-mono normal-case tracking-normal text-study-primary">
          {recordingTime > 0 ? `${recordingTime}s` : '60–90s'}
        </span>
      </div>

      <Waveform active={isRecording} liveVolume={liveVolume} />

      <LiveTranscriptionDisplay
        transcript={liveTranscript}
        interimTranscript={interimTranscript}
        isRecording={isRecording}
        wpm={liveWpm}
        targetOutline={targetOutline}
      />

      <RecordButton
        isRecording={isRecording}
        isProcessing={isProcessing}
        isComplete={isComplete}
        recordingTime={recordingTime}
        onStart={onStartRecording}
        onStop={onStopRecording}
        onReset={onResetRecording}
        usingRealMic={usingRealMic}
        startDisabled={startDisabled}
      />
      <p className="max-w-sm text-[11px] leading-relaxed text-study-text-muted">
        Nói tự nhiên theo gợi ý. Bạn sẽ nhận transcript và phản hồi ngay sau khi dừng ghi âm.
      </p>
    </motion.div>
  )
}
