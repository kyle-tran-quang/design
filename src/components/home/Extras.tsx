import { motion, useReducedMotion } from 'motion/react'
import { extras } from '@/content/home'
import { deckIn } from '@/components/motion/deck'
import { SparkleIcon } from '../icons'
import ExtraCard from './ExtraCard'

export default function Extras() {
  const reduced = useReducedMotion()
  return (
    <div className="flex shrink-0 flex-col border-b border-line pb-12 lg:min-h-[650px] lg:w-[1549px] lg:self-center">
      <div className="flex items-center gap-6">
        <h2 className="flex shrink-0 items-center gap-3 type-lede text-accent">
          <span>
            …and some <strong className="font-bold">extras!</strong>
          </span>
          <SparkleIcon className="size-6" />
        </h2>
        <span aria-hidden="true" className="h-px flex-1 bg-line" />
      </div>

      <ul className="mt-8 grid gap-10 md:grid-cols-2 lg:mt-[47px] lg:flex lg:gap-20">
        {/* Tablets: a card left over on the last row sits centred under the pair instead of leaving a gap beside it. */}
        {extras.map((extra, i) => (
          <motion.li
            key={extra.href}
            {...deckIn(i, extras.length, reduced)}
            className="max-w-[463px] md:max-lg:last:odd:col-span-2 md:max-lg:last:odd:w-[calc(50%-20px)] md:max-lg:last:odd:justify-self-center lg:w-[463px] lg:shrink-0"
          >
            <ExtraCard extra={extra} />
          </motion.li>
        ))}
      </ul>
    </div>
  )
}
