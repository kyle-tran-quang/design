import { useMemo, useRef, type ElementType } from 'react'
import { motion, useInView } from 'motion/react'
import { entranceProps, textPresets, type TextPreset } from './presets'

type TextEffectProps = {
  text: string
  preset: TextPreset
  as?: ElementType
  className?: string
  /** `mount` plays once `play` is true; `inView` also waits until it scrolls into view. */
  trigger?: 'mount' | 'inView'
  /** Gate for the start, e.g. the end of a page curtain. */
  play?: boolean
  /** Keep the text fully visible until it plays (see `entranceProps`). */
  hold?: boolean
}

/** Framer text effect: the text animates in character by character or word by word. */
export default function TextEffect({
  text,
  preset,
  as: Tag = 'span',
  className,
  trigger = 'mount',
  play = true,
  hold = false,
}: TextEffectProps) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })
  const { tokenize, from, transition, stagger, startDelay } = textPresets[preset]
  const active = play && (trigger === 'mount' || inView)
  const motionProps = entranceProps(from, active, hold)

  const words = useMemo(() => text.split(' '), [text])
  let index = 0
  const token = (content: string, key: string) => (
    <motion.span
      key={key}
      className="inline-block"
      {...motionProps}
      transition={{ ...transition, delay: startDelay + index++ * stagger }}
    >
      {content}
    </motion.span>
  )

  return (
    <Tag ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, w) => (
          <span key={w}>
            {w > 0 && ' '}
            {tokenize === 'word' ? (
              token(word, `w${w}`)
            ) : (
              <span className="inline-block whitespace-nowrap">{Array.from(word).map((ch, c) => token(ch, `c${w}-${c}`))}</span>
            )}
          </span>
        ))}
      </span>
    </Tag>
  )
}
