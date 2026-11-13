import { useState, type ReactNode } from 'react'
import { MotionConfig } from 'motion/react'
import ProjectNav from '@/components/ProjectNav'
import SectionNav, { type SectionNavItem } from '@/components/case-study/SectionNav'
import { ArrowLeftIcon } from '@/components/icons'
import CaseStudyHero from '@/components/case-study/CaseStudyHero'
import ContactFooter from '@/components/case-study/ContactFooter'
import SectionHeading from '@/components/case-study/SectionHeading'
import UpNext from '@/components/case-study/UpNext'
import BreadsliceCinematic from '@/components/case-study/breadslice/BreadsliceCinematic'
import BreadsliceHeroArt from '@/components/case-study/breadslice/BreadsliceHeroArt'
import { BombIcon, ClimbIcon, HeartIcon } from '@/components/case-study/breadslice/PixelIcons'
import { readingFrame, textFrame } from '@/components/case-study/frame'
import Reveal from '@/components/motion/Reveal'
import { asset } from '@/lib/asset'
import { framerImage } from '@/lib/framerImages'
import { workHref } from '@/lib/routes'


const sections: SectionNavItem[] = [
  {
    id: 'part-1',
    label: 'The high of the spark',
    children: [
      { id: 'reiterations', label: 'The endless reiterations' },
      { id: 'users-loved', label: 'What the users loved' },
    ],
  },
  {
    id: 'part-2',
    label: 'How scope creep killed Breadslice',
    children: [
      { id: 'scope-creep', label: 'The humongous scope creep' },
      { id: 'last-straw', label: 'The last straw' },
    ],
  },
  {
    id: 'part-3',
    label: 'Rising again from the wreckage',
    children: [
      { id: 'lesson-1', label: 'Lesson one: know your scope' },
      { id: 'lesson-2', label: 'Lesson two: manage expectations' },
      { id: 'lesson-3', label: 'Lesson three: trust the process' },
    ],
  },
]

/*
 * Type presets from the Framer export. Framer's breakpoints are 810px (tablet)
 * and 1200px (desktop); the label preset steps up again at 1440px.
 */
const label = 'type-subtopic'
/** Shared case study body size, so the copy matches the other case studies. */
const body = `type-body text-ink ${readingFrame}`
/** Several body paragraphs: the preset's 12px paragraph spacing. */
const prose = `${body} space-y-3`
const lessonEyebrow = 'type-caption text-graphite'
const lessonTitle = 'type-topic text-black'

/** "Text body" band: 1000px column, padded 24 / 80 / 160px (24px matches the other case study pages on phones). */
const textBand = 'mx-auto max-w-[1920px] px-6 py-16 min-[810px]:px-20 min-[1200px]:px-40 min-[810px]:py-[120px]'

function Img({ src, aspect, className = '', rounded = 'rounded-xl' }: { src: string; aspect: string; className?: string; rounded?: string }) {
  return <img src={src} alt="" loading="lazy" className={`w-full bg-mist object-cover ${rounded} ${aspect} ${className}`} />
}

/** Part 1 row: a 30% label column beside the copy (stacked on phones). */
function StoryRow({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-6 min-[810px]:flex-row">
      <div className="min-[810px]:w-[30%] min-[810px]:shrink-0">
        {/* The same topic heading size as the other case studies' row headings. */}
        <h3 className="w-4/5 type-topic">{title}</h3>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-10">{children}</div>
    </div>
  )
}

/** Part 2 screenshot with its note; on tablet the note sits above the image. */
function Downfall({ src, aspect, title, children }: { src: string; aspect: string; title: string; children: ReactNode }) {
  return (
    <figure className="flex min-w-0 flex-1 flex-col gap-5 min-[810px]:gap-6">
      <Img src={src} aspect={aspect} className="min-[810px]:order-1 min-[1200px]:order-none" />
      <figcaption className={`w-full min-[1200px]:w-4/5 ${prose}`}>
        <p className="font-bold">{title}</p>
        <p>{children}</p>
      </figcaption>
    </figure>
  )
}

function Lesson({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: ReactNode }) {
  return (
    <div id={id} className="flex flex-col gap-8">
      <hgroup>
        <p className={lessonEyebrow}>{eyebrow}</p>
        <h3 className={lessonTitle}>{title}</h3>
      </hgroup>
      {children}
    </div>
  )
}

export default function Breadslice() {
  // The cinematic covers the page on load; the header's entrance starts as it slides away.
  const [revealed, setRevealed] = useState(false)

  return (
    // Framer honours the OS "reduce motion" setting; so do these effects.
    <MotionConfig reducedMotion="user">
      <div className="overflow-x-clip bg-white">
        <BreadsliceCinematic onOut={() => setRevealed(true)} />
        <ProjectNav />
        <SectionNav items={sections} />

        <CaseStudyHero
          title="2.5 years, 1 designer and a stillborn Breadslice"
          summary="This is the story of its brilliant conception, its painful collapse, and the hard-won lessons I carried out of the wreckage."
          art={<BreadsliceHeroArt />}
          role="Designer + Sub-PM"
          timelineLabel="Year"
          timeline="2021 - 2024"
          play={revealed}
        />

        <main>
          {/* Part 1 */}
          <section aria-labelledby="part-1" className={textBand}>
            <div className={`${textFrame} flex flex-col gap-16 min-[810px]:gap-20`}>
              <SectionHeading id="part-1" eyebrow="— PART 1" title="The High of the Spark" />

              <StoryRow title="Spark">
                <p className={body}>
                  It all began with a simple but electrifying question. Mr. J, my boss at the time, shared a vision for a
                  multi-purpose audio editing platform centered on podcast creation.
                </p>
              </StoryRow>

              <StoryRow title="Discovery">
                <p className={body}>
                  We spoke to dozens of podcasters, mixers, and video creators who relied on complex desktop tools like
                  Logic Pro, Audacity, and Premiere. Yet, their biggest frustration was mobility.{' '}
                  <strong className="font-bold">
                    There was no easy way for them to create professional-grade audio tracks on the go.
                  </strong>
                </p>
                <Img src={asset('assets/images/breadslice-body-1.webp')} aspect="aspect-[1970/1148]" />
              </StoryRow>

              <StoryRow title="Big question">
                <p className={body}>
                  That insight led to the challenge:{' '}
                  <strong className="font-bold">
                    How might we translate these intricate, horizontal desktop workflows into the small, vertical space
                    of a smartphone?
                  </strong>{' '}
                  The answer was <strong className="font-bold">Breadslice</strong> — our metaphor for slicing a complex
                  project into simple, manageable pieces. It felt revolutionary.
                </p>
                <div className="flex flex-col gap-2.5">
                  <Img src={asset('assets/images/breadslice-body-3.webp')} aspect="aspect-[1970/1148]" />
                  <Img src={asset('assets/images/breadslice-body-2.webp')} aspect="aspect-[1970/1148]" />
                </div>
              </StoryRow>

              <StoryRow title="Craft">
                <p className={body}>
                  I was the sole product designer on board in the team. Each iteration brought us closer to something
                  special. By the end, my design files held over 3,000 UIs - proof of our shared obsession to craft not
                  just an app, but a masterpiece for creators on the move.
                </p>
              </StoryRow>
            </div>
          </section>

          {/* The endless reiterations: full-bleed image */}
          <section aria-labelledby="reiterations" className="mx-auto max-w-[1920px] pt-3 pb-20 max-[809px]:pt-0">
            <div className="px-6 min-[810px]:px-20 min-[1200px]:px-40">
              <div className={`${textFrame} flex flex-col gap-3`}>
                <ClimbIcon className="size-10 text-periwinkle" />
                <div>
                  <h3 id="reiterations" className={`text-graphite ${label}`}>
                    The endless reiterations
                  </h3>
                  <p className={body.replace('text-ink', 'text-graphite')}>
                    Below is Breadslice's main interface over time, from 2021 to 2024.
                  </p>
                </div>
              </div>
            </div>
            <img
              src={framerImage('n5LtkajIeCvoTHxPv6mnu6zKUY', 'png', 2048)}
              alt="Breadslice's main interface across every iteration from 2021 to 2024"
              loading="lazy"
              className="aspect-[2621/2720] w-full object-cover"
            />
          </section>

          {/* What the users loved */}
          <section
            aria-labelledby="users-loved"
            className="mx-auto flex max-w-[1920px] flex-col gap-5 px-4 pt-20 pb-4 min-[810px]:gap-10 min-[810px]:px-10 min-[810px]:py-3"
          >
            {/* Inset to the same 1000px frame as the text bands, while the image below runs wider. */}
            <div className="px-2 min-[810px]:px-10 min-[1200px]:px-[120px]">
              <div className={`${textFrame} flex flex-col gap-3`}>
                <HeartIcon className="size-12 text-accent" />
                <div className="w-full max-w-[560px]">
                  <h3 id="users-loved" className={`text-graphite ${label}`}>
                    What the users loved
                  </h3>
                  <p className={body.replace('text-ink', 'text-graphite')}>
                    They loved the ability to fine-tune things based on how precise the tools we offered were. "Slow but
                    steady and precise" they said. But the cherry on top was how we also offered them tools that they
                    could quickly use in the "Slice" interface.
                  </p>
                </div>
              </div>
            </div>
            <Img
              src={framerImage('LT9uZaHPoTvePf3dqntMdGxdQoE', 'png', 2048)}
              aspect="aspect-[3840/3539]"
              rounded="rounded-[20px]"
            />
          </section>

          {/* Part 2 */}
          <section aria-labelledby="part-2" className={textBand}>
            <div className={`${textFrame} flex flex-col gap-16 min-[810px]:gap-20`}>
              <SectionHeading id="part-2" eyebrow="— PART 2" title="How scope creep killed Breadslice" />

              <div className={prose}>
                <h3 id="scope-creep" className={`text-ink ${label}`}>
                  The humongous scope creep
                </h3>
                <p>
                  We spent <strong className="font-bold">two whole months</strong> just deciding how the label structure
                  would work. Then <strong className="font-bold">another month</strong> was lost debating what the video
                  reaction recording feature would be like, followed by{' '}
                  <strong className="font-bold">another month</strong> just designing the reaction interfaces.
                </p>
              </div>

              <div className="flex flex-col gap-16 min-[810px]:flex-row min-[810px]:gap-2.5">
                <Downfall
                  src={framerImage('wdYHX8wcNUNR6FOmRfhkkcA3kDo', 'png', 1024)}
                  aspect="aspect-[1634/1154]"
                  title="The labelling system (colorful badges)"
                >
                  This wasted us 2 months just to decide what worked best: How the user would change the color, names of
                  the labels, and how to show them on the home screen. (that's it)
                </Downfall>
                <Downfall
                  src={framerImage('SzsX7XW9RxffMXb5EYrTx8JS9w', 'png', 1024)}
                  aspect="aspect-[1634/1154]"
                  title="Animations building"
                >
                  Another example is how I spent over 1 month just to touch-up these animations, and then the other month
                  the whole idea was scrapped as we got an another iteration we needed to focus on.
                </Downfall>
              </div>

              <Downfall
                src={framerImage('q4L0TEapZn7OO2PefHIs25WZ0', 'png', 2048)}
                aspect="aspect-[3494/1944]"
                title="The library interface"
              >
                Even something we thought as simple as this took us a lot of time to refine as well, since we thought it
                to be the first touchpoint when someone uses Breadslice.
              </Downfall>

              <div className="flex flex-col gap-[120px]">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2.5">
                    <BombIcon className="size-10 text-black opacity-50" />
                    <h3 id="last-straw" className={`text-black ${label}`}>
                      Too much testing, too little outcome, and the last straw
                    </h3>
                  </div>
                  <p className={body}>
                    Alongside my colleagues, I argued that an imperfect product users could shape beat a perfect one
                    that never launched. But week after week, we circled back to features that were already good
                    enough, while our runway got shorter.
                  </p>
                </div>

                <figure className="flex flex-col gap-6 min-[810px]:flex-row min-[810px]:items-end">
                  <Img
                    src={framerImage('1XIO9cO6aFmBWUda0u4LMLMY')}
                    aspect="aspect-[664/373]"
                    className="min-[810px]:w-3/5 min-[810px]:shrink-0 min-[1200px]:w-[531px]"
                  />
                  <figcaption className="flex flex-1 flex-col gap-2.5">
                    <ArrowLeftIcon className="size-6 text-muted" />
                    <div className={`type-body text-ink ${readingFrame}`}>
                      <p className="font-bold">This is why we failed.</p>
                      <p>We kept perfecting isolated pieces, never finishing a usable whole.</p>
                      <p className="text-muted">Image by whatsthepont.blog</p>
                    </div>
                  </figcaption>
                </figure>

                <div className={prose}>
                  <p>
                    <strong className="font-bold">The end was simple and brutal: We ran out of funds.</strong> But
                    honestly, no one was to blame.
                  </p>
                  <p>
                    The investors grew tired of the endless delays and the lack of a market-ready product and then backed
                    out. Breadslice, after countless iterations and two and a half years of my life, was unceremoniously
                    moved to the bin.
                  </p>
                  <p>I had to move on, but first, I had to understand what I’d lost, and what I’d gained.</p>
                </div>
              </div>
            </div>
          </section>

          {/*
           * The wreckage: still and animation side by side at every width, inset to the text bands' frame.
           * Each image keeps its own proportions (no square crop), so neither is cut off.
           */}
          <section className="mx-auto max-w-[1920px] px-6 py-4 min-[810px]:px-20 min-[810px]:py-3 min-[1200px]:px-40">
            <div className={textFrame}>
              <Reveal preset="lift" className="grid max-w-[760px] grid-cols-2 items-start gap-3 min-[810px]:gap-6">
                <Img src={framerImage('FyTAU8HLKGXezWkUv8Ikc7YQoLY', 'png', 1024)} aspect="h-auto" />
                <Img src={framerImage('kc5w2OtgfNpGLlHHNFk874SdfXE', 'gif')} aspect="h-auto" />
              </Reveal>
            </div>
          </section>

          {/* Part 3 */}
          <section aria-labelledby="part-3" className={textBand}>
            <div className={`${textFrame} flex flex-col gap-16 min-[810px]:gap-20`}>
              <SectionHeading id="part-3" eyebrow="— PART 3" title="Rising again from the wreckage" />

              <div className="flex flex-col gap-16">
                <Lesson id="lesson-1" eyebrow="Lesson one -" title="Being ambitious is good, but know your scope and their problem">
                  <div className={prose}>
                    <p>
                      We became so attached to that grand vision that we failed to see what users needed{' '}
                      <em>right now</em>.
                    </p>
                    <p>
                      In our perfectionism, we failed to address the{' '}
                      <strong className="font-bold">critical 5% of functionality that 95% of our users needed</strong>: a
                      fast, simple way to capture an idea and get it out into the world.
                    </p>
                  </div>
                </Lesson>

                <figure className="flex flex-col min-[810px]:gap-6 min-[1200px]:flex-row">
                  <Img
                    src={framerImage('cZt5YEBAbiMIRhXvLH9EnXy0k', 'jpg', 1024)}
                    aspect="aspect-[4774/5391]"
                    className="min-[1200px]:flex-1"
                  />
                  <figcaption
                    className={`w-3/4 pt-6 min-[810px]:w-full min-[810px]:pt-0 min-[1200px]:flex-[0.75] min-[1200px]:pt-6 ${body}`}
                  >
                    <div className="space-y-3 min-[1200px]:max-w-[428px]">
                      <p className="font-bold">
                        This should've been the only thing that we needed at first (a 95% cut-down version).
                      </p>
                      <p>
                        We had finished this flow (adequate enough to be the MVP) back in early 2022, but…we spent an
                        another 2 years just to focus on the extras and the bling-blings.
                      </p>
                    </div>
                  </figcaption>
                </figure>
              </div>

              <Lesson id="lesson-2" eyebrow="Lesson two -" title="Manage micromanagement & expectations, instead of fighting it">
                <p className={body}>
                  During the outset of the failure, I saw our perfectionism as a roadblock. Now, I see it as a powerful
                  engine that was pointed in the wrong direction. Instead of pushing back, I would embrace our drive for
                  quality and learn to manage J's expectations. I would frame the MVP not as a compromise, but as a
                  strategic tool to gather the data we needed to achieve his vision of perfection. I would have made him
                  a partner in the strategy of "fast learning," not an obstacle to it.
                </p>
              </Lesson>

              <Lesson id="lesson-3" eyebrow="Lesson three -" title="We can't follow the whole process, still we have to trust it.">
                <Img src={framerImage('RPhC4DN7RtxEGI6MdYNXBp7aeCY')} aspect="aspect-[686/307]" />
                <div className={prose}>
                  <p>
                    <code className="font-sans">
                      In a world of fast products, users decide in minutes what stays or goes.
                    </code>
                  </p>
                  <p>
                    But in reality, the path is messy, full of revisions and shortcuts; success comes from shipping
                    early, learning fast, and embracing imperfection. The real question is, how do we create long-term
                    value?
                  </p>
                  <p>
                    I didn't get a successful product out of my 2.5 years on Breadslice. But I walked away a different
                    designer: <strong className="font-bold">more empathetic, more strategic, and more resilient.</strong>{' '}
                    The project failed, but the growth was real.
                  </p>
                </div>
              </Lesson>
            </div>
          </section>

          {/* Closing full-width image */}
          <section className="mx-auto max-w-[1920px] px-4 pt-6 pb-4 min-[810px]:px-10 min-[810px]:py-5">
            <Reveal preset="lift" className="overflow-hidden rounded-[20px]">
              <Img src={framerImage('Wd9ZTnxswmLwZx9uzCO4y2pOQ')} aspect="aspect-[1.75/1]" rounded="rounded-[20px]" />
            </Reveal>
          </section>
        </main>

        <UpNext
          href={workHref('unblok')}
          title="Dream hacking to unlock creativity with Unblok and Apple Watch sensors"
          image={asset('assets/images/shared-card-unblok-1024w.avif')}
        />
        <ContactFooter />
      </div>
    </MotionConfig>
  )
}
