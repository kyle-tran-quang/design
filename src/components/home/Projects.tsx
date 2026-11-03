import { motion, useReducedMotion } from 'motion/react'
import { works } from '@/content/home'
import { deckIn } from '@/components/motion/deck'
import { ElasticDivider, PillDivider } from './Dividers'
import Extras from './Extras'
import SectionIntro from './SectionIntro'
import WorkCard from './WorkCard'

/**
 * The two leaning books, drawn upright and rotated about the bottom-left corner they rest on (the rotation reproduces
 * the traced artwork). Book 4 tips onto the shelf, then book 5 tips onto it: an accelerating fall, a small rebound.
 */
const fallingBooks = [
  { x: 356.3, y: -1.89, width: 34.91, height: 273.29, angle: -18.02, delay: 0.2 },
  { x: 483.2, y: 0.06, width: 34.98, height: 273.34, angle: -34.87, delay: 0.6 },
]

export default function Projects() {
  const reduced = useReducedMotion()
  return (
    <section
      id="projects"
      aria-label="Case studies"
      className="flex shrink-0 flex-col gap-12 px-6 pt-24 sm:px-10 lg:h-full lg:flex-row lg:items-center lg:gap-20 lg:pt-0 lg:pr-10 lg:pl-40"
    >
      <SectionIntro index="01/" title="Case studies">
        {/* Bookshelf: three upright books, two leaning ones and a ball, traced from the original artwork. */}
        {/* overflow-visible: standing upright, the last book reaches just past the artwork's right edge. */}
        <svg viewBox="0 0 512 272" className="w-full max-w-[310px] overflow-visible" aria-hidden="true">
          <g fill="#e8e8e8">
            <rect width="136" height="272" />
            <rect x="142" width="86" height="272" />
            <rect x="234" width="35" height="272" />
            {fallingBooks.map((book) => (
              <motion.rect
                key={book.x}
                x={book.x}
                y={book.y}
                width={book.width}
                height={book.height}
                style={{ originX: 0, originY: 1 }}
                initial={{ rotate: reduced ? book.angle : 0 }}
                whileInView={{ rotate: [0, book.angle, book.angle * 0.9, book.angle] }}
                viewport={{ once: true, amount: 0.6 }}
                transition={
                  reduced
                    ? { duration: 0 }
                    : { duration: 0.8, delay: book.delay, times: [0, 0.62, 0.8, 1], ease: ['easeIn', 'easeOut', 'easeIn'] }
                }
              />
            ))}
          </g>
          <g fill="#fdc944">
            <rect width="136" height="7.5" />
            <rect x="142" width="86" height="7.5" />
            <rect x="234" width="35" height="7.5" />
          </g>
          <circle cx="441.5" cy="256" r="16" fill="#fb8337" />
        </svg>
      </SectionIntro>

      <ElasticDivider />

      <div className="grid gap-8 md:grid-cols-2 lg:flex lg:gap-20">
        {works.map((work, i) => (
          <motion.div key={work.title} {...deckIn(i, works.length, reduced)} className="shrink-0 lg:self-center">
            <WorkCard work={work} />
          </motion.div>
        ))}
      </div>

      <PillDivider />
      <Extras />
      <ElasticDivider />
    </section>
  )
}
