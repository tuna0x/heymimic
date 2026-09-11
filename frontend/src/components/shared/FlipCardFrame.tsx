import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { learningFlipTransition } from './learningMotion'
import { cn } from '../../lib/cn'

interface FlipCardFrameProps {
  flipped: boolean
  front: ReactNode
  back: ReactNode
  className?: string
}

export function FlipCardFrame({ flipped, front, back, className }: FlipCardFrameProps) {
  return (
    <div className={cn('[perspective:1200px]', className)}>
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={learningFlipTransition}
        className="grid [transform-style:preserve-3d]"
        aria-live="polite"
      >
        <div
          className="col-start-1 row-start-1 [backface-visibility:hidden]"
          style={{ pointerEvents: flipped ? 'none' : 'auto' }}
          aria-hidden={flipped}
        >
          {front}
        </div>
        <div
          className="col-start-1 row-start-1 [backface-visibility:hidden] [transform:rotateY(180deg)]"
          style={{ pointerEvents: flipped ? 'auto' : 'none' }}
          aria-hidden={!flipped}
        >
          {back}
        </div>
      </motion.div>
    </div>
  )
}
