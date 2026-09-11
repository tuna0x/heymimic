export const learningEase = [0.22, 1, 0.36, 1] as const

export const learningDurations = {
  micro: 0.12,
  standard: 0.18,
  emphasis: 0.24,
} as const

export const learningFadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: { duration: learningDurations.standard, ease: learningEase },
}

export const learningFlipTransition = {
  duration: 0.2,
  ease: learningEase,
}
