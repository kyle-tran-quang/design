import { motion, type HTMLMotionProps, type TargetAndTransition } from 'motion/react'
import { restingState, scrollPresets, type ScrollPreset } from './presets'

type RevealProps = HTMLMotionProps<'div'> & {
  preset: ScrollPreset
  /** Extra delay in seconds, added to the preset's. */
  delay?: number
}

/** Framer "appear on scroll" effect: animates in when enough of it is in view. */
export default function Reveal({ preset, delay = 0, ...props }: RevealProps) {
  const p = scrollPresets[preset]
  return (
    <motion.div
      initial={p.from}
      whileInView={restingState(p.from) as TargetAndTransition}
      viewport={{ once: p.once, amount: p.amount }}
      transition={{ ...p.transition, delay }}
      {...props}
    />
  )
}
