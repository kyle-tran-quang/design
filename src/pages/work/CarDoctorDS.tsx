import { useState, type ReactNode } from 'react'
import { MotionConfig } from 'motion/react'
import ProjectNav from '@/components/ProjectNav'
import SectionNav, { type SectionNavItem } from '@/components/case-study/SectionNav'
import CaseStudyHero from '@/components/case-study/CaseStudyHero'
import ContactFooter from '@/components/case-study/ContactFooter'
import SectionHeading from '@/components/case-study/SectionHeading'
import UpNext from '@/components/case-study/UpNext'
import { readingFrame, textFrame } from '@/components/case-study/frame'
import Reveal from '@/components/motion/Reveal'
import type { ScrollPreset } from '@/components/motion/presets'
import CarDSCinematic from '@/components/case-study/cardoctor-ds/CarDSCinematic'
import CarDSHeroArt from '@/components/case-study/cardoctor-ds/CarDSHeroArt'
import CarDSOrderArt from '@/components/case-study/cardoctor-ds/CarDSOrderArt'
import CarDSBoardArt from '@/components/case-study/cardoctor-ds/CarDSBoardArt'
import { media } from '@/components/case-study/cardoctor-ds/media'
import { asset } from '@/lib/asset'
import { workHref } from '@/lib/routes'

// Layout, type and colours follow the Framer export of /work/cardoctor-ds (desktop values, with its
// 810px and 1200px breakpoints mapped to md and xl). Side padding around text switches at 810px itself, in step
// with the shared frame and hero. Text sits in the 1000px frame; image bands run wider.
// Every image has an empty alt, as in the source; the surrounding copy carries the meaning.

/** Images the static export already localised. The rest come from `media()`. */
const local = (name: string) => asset(`assets/images/${name}`)

const inner = textFrame
const copy = 'type-body text-ink'
/** Body paragraphs, capped at the 600px reading width. */
const body = `${copy} ${readingFrame}`
const note = 'type-caption text-ink'
const problem = 'type-subtopic text-black'
const sidePad = 'px-6 min-[810px]:px-20 xl:px-[120px]'
/** Text chapters ("Research", "Development"): 120px padding, 80px between rows. */
const chapter = `flex flex-col items-center gap-16 py-16 md:gap-20 md:py-[120px] ${sidePad}`
/** Full-width image bands ("Project Hero Image"): 20px 40px padding. */
const imageBand = 'mx-auto flex w-full max-w-[1920px] flex-col px-4 pt-6 pb-4 md:px-10 md:py-5'
const divider = 'border-t border-silver pt-20'

const sections: SectionNavItem[] = [
  {
    id: 'how',
    label: "How's it possible?",
    children: [
      { id: 'challenge', label: 'Challenge' },
      { id: 'approach', label: 'Approach & impact' },
    ],
  },
  {
    id: 'part-1',
    label: 'The need for tidying up',
    children: [
      { id: 'backstory', label: 'Backstory' },
      { id: 'audit', label: 'Audit' },
    ],
  },
  {
    id: 'part-2',
    label: 'Building the simple design system',
    children: [
      { id: 'guidelines', label: 'Visual and style guidelines' },
      { id: 'buttons', label: 'Buttons, spacing and labelling' },
      { id: 'tokens', label: 'Tokens and variables' },
    ],
  },
  { id: 'part-3', label: 'Along with the Devs' },
]

function Shot({ src, className = '' }: { src: string; className?: string }) {
  return <img src={src} alt="" loading="lazy" className={`w-full object-cover ${className}`} />
}

/** Width ÷ height of the style guideline images, as the Framer export sets them. */
const STYLE_RATIOS = { style1: 1, style2: 1, style3: 1.75, style4: 1.35436, style5: 1, style6: 1 } as const
type StyleShot = keyof typeof STYLE_RATIOS

/**
 * One column of the style guidelines bento: its images stacked at their own aspect ratios. Side by side (md and up),
 * a column's width is set by its flex-grow, the inverse of the sum of its images' height-to-width ratios, so columns
 * with the same number of images end at exactly the same height. Stacked on phones, it is simply full width.
 * With `even`, every column takes the same width instead, and columns may end at slightly different heights.
 */
function BentoColumn({ shots, even = false }: { shots: StyleShot[]; even?: boolean }) {
  const grow = even ? 1 : 1 / shots.reduce((sum, key) => sum + 1 / STYLE_RATIOS[key], 0)
  return (
    <div className="flex min-w-0 flex-col gap-4 md:basis-0 md:gap-6" style={{ flexGrow: grow }}>
      {shots.map((key) => (
        <img
          key={key}
          src={media(key)}
          alt=""
          loading="lazy"
          className="w-full rounded-[20px] object-cover"
          style={{ aspectRatio: STYLE_RATIOS[key] }}
        />
      ))}
    </div>
  )
}

/** Two images side by side, each taking half the row. */
function Pair({ children, gap = 'gap-6' }: { children: ReactNode; gap?: string }) {
  return <div className={`flex w-full items-center ${gap} *:min-w-0 *:flex-1`}>{children}</div>
}

/** Topic on the left (30% column, heading at 80% of it), the story on the right. */
function Row({
  id,
  title,
  children,
  sticky = false,
  ruled = false,
  gap = 'gap-10',
}: {
  /** Anchor for the section nav; on the row, not the (possibly sticky) heading. */
  id?: string
  title: ReactNode
  children: ReactNode
  sticky?: boolean
  ruled?: boolean
  gap?: string
}) {
  return (
    <div id={id} className={`${inner} flex flex-col gap-6 md:flex-row md:items-start ${ruled ? divider : ''}`}>
      <div className={`shrink-0 md:w-[30%] ${sticky ? 'z-[1] md:sticky md:top-16' : ''}`}>
        <h3 className="type-topic w-4/5">{title}</h3>
      </div>
      <div className={`flex min-w-0 flex-1 flex-col ${gap}`}>{children}</div>
    </div>
  )
}

/** "Challenge" / "Approach & impact": topic on the left half, copy on the right half. */
function Brief({ id, title, paragraphs, ruled = false }: { id: string; title: string; paragraphs: string[]; ruled?: boolean }) {
  return (
    <div id={id} className={`${inner} flex flex-col gap-2.5 md:flex-row md:items-start ${ruled ? divider : ''}`}>
      <h3 className="type-topic md:flex-1">{title}</h3>
      <div className="flex flex-col gap-3 md:w-1/2">
        {paragraphs.map((text) => (
          <p key={text} className={body}>
            {text}
          </p>
        ))}
      </div>
    </div>
  )
}

/** Problem heading with its caption ("Problem 1:", "Problem 2:"). */
function Problem({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  return (
    <div className="md:w-3/4">
      <h4 className={problem}>
        Problem {number}:
        <br />
        {title}
      </h4>
      <p className={`${note} mt-[1.4em]`}>{children}</p>
    </div>
  )
}

/** 236px illustration that rises in as it scrolls into view. */
function Sticker({ src, className = '', preset = 'drift' }: { src: string; className?: string; preset?: ScrollPreset }) {
  return (
    <Reveal preset={preset} className={`relative z-[1] size-[236px] shrink-0 overflow-hidden ${className}`}>
      <img src={src} loading="lazy" className="size-full object-cover" />
    </Reveal>
  )
}

export default function CarDoctorDS() {
  // The cinematic covers the page on load; the header's entrance starts as it slides away.
  const [revealed, setRevealed] = useState(false)

  return (
    // Framer honours the OS "reduce motion" setting; so do these effects.
    <MotionConfig reducedMotion="user">
      <div className="overflow-x-clip bg-white">
        <CarDSCinematic onOut={() => setRevealed(true)} />
        <ProjectNav />
        <SectionNav items={sections} />

        <CaseStudyHero
          title="CarDoctor Design System"
          summary="A complete redesign of the CarDoctor system within 4 months — achieving 2x faster development time and a clear, cohesive look and feel across the brand presence."
          art={<CarDSHeroArt play={revealed} />}
          tallArt
          role="UX Designer"
          timelineLabel="Year"
          timeline="2024"
          play={revealed}
        />

        <main>
          {/* How's it possible? */}
          <section
            aria-labelledby="how"
            className="mx-auto flex max-w-[1400px] flex-col items-center gap-6 bg-white px-6 pt-16 md:gap-10 md:pt-[120px] min-[810px]:px-20 xl:gap-16 xl:px-[120px]"
          >
            <div className={`${inner} flex flex-col gap-8`}>
              <h2 id="how" className="type-section-title">
                How's it possible?
              </h2>
              <div className={`${body} md:w-4/5`}>
                <p>
                  I was working closely with <strong>a team of 4 designers and 4 frontend devs</strong>, we built a
                  feedback loop that balanced creativity with technical feasibility.
                </p>
                <p>
                  Nothing is ever perfect, so we applied the “<strong>steal like an artist</strong>” philosophy that
                  borrows design patterns and component logic from frameworks like Tailwind CSS & ShadCDN to create a
                  clean, efficient, and scalable design system (currently under NDA so shhh… I can only share this
                  much).
                </p>
              </div>
            </div>
            <div className={`${inner} flex justify-end`}>
              <Sticker src={local('cardoctor-ds-challenge-solution.png')} preset="slideUp" />
            </div>
          </section>

          {/* Challenge and approach */}
          <section
            aria-label="Challenge and approach"
            className="flex flex-col items-center gap-16 border-t border-silver px-6 py-12 md:gap-20 md:py-[120px] min-[810px]:px-20 xl:px-[120px]"
          >
            <Brief
              id="challenge"
              title="Challenge"
              paragraphs={["CarDoctor’s design system was inconsistent, culturally mismatched, and lacked ownership."]}
            />
            <Brief
              id="approach"
              title="Approach & impact"
              ruled
              paragraphs={[
                'I led a four-month redesign to build a unified, locally aligned system.',
                'The impact was 2x faster development, stronger cross-team alignment, and a modern, cohesive user experience that sets the tone for future CarDoctor projects.',
              ]}
            />
          </section>

          <div className={imageBand}>
            <CarDSOrderArt />
          </div>

          {/* Part 1 */}
          <section aria-labelledby="part-1" className={`border-t border-line ${chapter}`}>
            <div className={inner}>
              <SectionHeading id="part-1" eyebrow="— PART 1" title="The need for tidying up" />
            </div>

            <Row id="backstory" title="Backstory">
              <div className={`${body} space-y-3`}>
                <p>
                  When I joined CarDoctor, I suddenly found myself wearing every hat - strategist, senior, and
                  decision-maker.
                </p>
                <p>
                  At the time, everything was a patchwork of visual trends, copying popular fintech apps in Vietnam
                  without truly understanding user needs and just ticking off stakeholder requests.
                </p>
              </div>
            </Row>

            <Row id="audit" title="Audit" ruled gap="gap-20">
              <p className={body}>
                One of the biggest challenges I faced while designing CarDoctor’s platform was the growing
                inconsistency between the design and the live product. Something felt off - were the developers working
                with a different set of assets? Nope.
              </p>

              <div className="flex flex-col gap-6">
                <Problem number={1} title="Inconsistent styles and elements">
                  The system had disorganized variants of the same elements: buttons, icons and unpolished color
                  theory, leading to a confusing experience that made people drop off from the home screen.
                </Problem>
                <Pair gap="gap-2.5">
                  <div className="flex aspect-[0.839416] items-center justify-center overflow-hidden rounded-[20px] bg-[#7383ff]">
                    <img
                      src={media('problem1')}
                      alt=""
                      loading="lazy"
                      className="aspect-[268/294] w-[268px] max-w-[80%] rounded-[20px] object-cover"
                    />
                  </div>
                  <Shot
                    src={local('cardoctor-ds-research.webp')}
                    className="aspect-[0.839474] rounded-[20px]"
                  />
                </Pair>
              </div>

              <div className="flex flex-col gap-6">
                <Problem number={2} title="Misalignment with local context">
                  Instead of building a dedicated system, the design team had borrowed components directly from a
                  Korean product design system.
                </Problem>
                <Shot
                  src={media('problem2a')}
                  className="aspect-[1.77108] rounded-[20px]"
                />
                <Shot
                  src={media('problem2b')}
                  className="aspect-[1.61053] rounded-[20px]"
                />
                <p className={note}>It was a nightmare for developers.</p>
              </div>
            </Row>

            <div className={`${inner} flex flex-col gap-6`}>
              <div className="md:w-3/5">
                <h3 className="type-subtopic text-black">
                  Problem 3:
                  <br />
                  No clear guidelines or ownership
                </h3>
                <p className={`${note} mt-[26px] xl:mt-8`}>
                  There were no guiding principles. Below is everything we had at the moment.
                </p>
              </div>
              <Shot
                src={media('problem3')}
                className="aspect-[2.4] rounded-[20px]"
              />
            </div>
          </section>

          {/* Part 2 */}
          <section
            aria-labelledby="part-2"
            className={`flex flex-col items-center gap-16 bg-snow pt-16 pb-16 md:gap-[120px] md:pt-[120px] md:pb-[60px] ${sidePad}`}
          >
            <div className={inner}>
              <SectionHeading id="part-2" eyebrow="— PART 2" title="Building the simple design system" />
            </div>
            <Row id="guidelines" title={<strong className="font-bold">Visual and style guidelines</strong>}>
              <p className={body}>
                I began by defining a type scale that improved readability across all screens, introduced a balanced
                color system for contrast and accessibility, and established consistent grid styles and iconography.
                Color semantics across tokens were also laid out.
              </p>
              <svg
                viewBox="0 0 24 24"
                className="size-6 fill-none stroke-black"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M6.75 13.75 12 19.25l5.25-5.5M12 18.25V4.75" />
              </svg>
            </Row>
          </section>

          {/* Visual and style guidelines: one vertical bento, every image at its own aspect ratio. Three equal-width
              columns on desktop, two on tablets, one on phones. */}
          <div className={imageBand}>
            <div className="hidden items-start gap-6 lg:flex">
              <BentoColumn shots={['style1', 'style3']} even />
              <BentoColumn shots={['style5', 'style2']} even />
              <BentoColumn shots={['style6', 'style4']} even />
            </div>
            <div className="flex flex-col gap-4 md:flex-row md:gap-6 lg:hidden">
              <BentoColumn shots={['style1', 'style3', 'style5']} />
              <BentoColumn shots={['style2', 'style4', 'style6']} />
            </div>
          </div>

          <section aria-labelledby="buttons" className={`flex flex-col items-center gap-16 bg-snow py-16 md:gap-[120px] md:py-[120px] ${sidePad}`}>
            <div className={`${inner} flex flex-col gap-6 md:flex-row md:items-start`}>
              <div className={`${body} shrink-0 md:w-[30%] md:pt-8`}>
                <p className="w-[90%]">
                  <strong id="buttons" className="font-bold">
                    Buttons, spacing and labelling
                  </strong>
                </p>
                <p className="w-[90%]">
                  We categorized every existing button, found the patterns that actually worked, and rebuilt them into a
                  single, flexible button system with clear spacing, labelling rules and responsive states.
                </p>
              </div>
              <Shot
                src={media('buttons1')}
                className="aspect-square min-w-0 flex-1 rounded-[20px]"
              />
            </div>
          </section>

          <div className={`${imageBand} gap-4 md:gap-12`}>
            <Pair>
              <Shot src={media('buttons2')} className="aspect-square rounded-[20px]" />
              <Shot src={media('buttons3')} className="aspect-square rounded-[20px]" />
            </Pair>
          </div>

          <section
            aria-labelledby="tokens"
            className="mx-auto flex max-w-[1200px] flex-col items-center gap-16 bg-snow px-6 py-16 md:gap-12 md:py-[120px] min-[810px]:px-20 xl:px-[120px]"
          >
            <div className={inner}>
              <div className={`${body} w-[90%]`}>
                <p>
                  <strong id="tokens" className="font-bold">
                    Tokens and Variables
                  </strong>
                </p>
                <p>
                  In early 2024, I stumbled across Figma’s new Variables feature, and felt that it would really be
                  helpful. That was exactly what we needed to upscale our system.
                </p>
                <p>Before that, updating colors or typography meant manual changes across countless components.</p>
                <p>
                  We implemented a token-based structure that defined tokens for context that automatically cascaded
                  through every component.
                </p>
              </div>
            </div>
            <Shot
              src={media('tokens1')}
              className="aspect-[1.90031] rounded-[20px]"
            />
            <Shot
              src={media('tokens2')}
              className="aspect-square rounded-[20px]"
            />
          </section>

          {/* Part 3 */}
          <section aria-labelledby="part-3" className={`flex flex-col items-center gap-16 bg-snow pt-16 md:gap-[120px] md:pt-[120px] ${sidePad}`}>
            <div className={inner}>
              <SectionHeading id="part-3" eyebrow="— PART 3" title="Along with the Devs" />
            </div>
            <div className={`${inner} flex flex-col gap-12 md:flex-row md:items-start md:max-xl:items-end`}>
              <Sticker src={local('shared-footer-about-me-card.png')} className="order-1 border-b-2 border-[#787878] md:order-none" />
              <div className="min-w-0 flex-1 rounded-[20px] bg-mist p-8 md:max-xl:bg-transparent">
                <div className={copy}>
                  <p>
                    <strong className="font-bold">Putting it all together</strong>
                  </p>
                  <p>
                    Next up, I set to answer how these component patterns make users feel at ease, guide their
                    attention, and actually make them take action?
                  </p>
                  <p>
                    The examples you can see down below is for the Garage Management System where everything were put
                    altogether.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <div className={`${imageBand} gap-4 md:gap-12`}>
            <figure className="flex flex-col gap-4 md:gap-6">
              <CarDSBoardArt />
              <figcaption className={`${inner} ${note}`}>
                <p className="md:w-1/2">
                  An example is the kanban-style order board, where garage owners can track and visualize customers'
                  orders at a glance.
                </p>
              </figcaption>
            </figure>
            <Shot
              src={media('devs2')}
              className="aspect-[1.75768] rounded-xl"
            />
          </div>

          <div className={imageBand}>
            <Pair gap="gap-2.5">
              <Shot src={media('devs3')} className="aspect-square rounded-xl" />
              <Shot src={media('devs4')} className="aspect-square rounded-xl" />
            </Pair>
          </div>

          <div className={imageBand}>
            <Pair gap="gap-2.5">
              <Shot src={media('devs5')} className="aspect-square rounded-xl" />
              <Shot src={media('devs6')} className="aspect-square rounded-xl" />
            </Pair>
          </div>
        </main>

        <UpNext
          href={workHref('breadslice')}
          title="2.5 years, 1 designer and a stillborn Breadslice"
          image={local('shared-card-breadslice.avif')}
        />
        <ContactFooter />
      </div>
    </MotionConfig>
  )
}
