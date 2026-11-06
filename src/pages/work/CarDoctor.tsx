import { useState, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import AutoplayVideo from '@/components/AutoplayVideo'
import ProjectNav from '@/components/ProjectNav'
import SectionNav, { type SectionNavItem } from '@/components/case-study/SectionNav'
import CaseStudyHero from '@/components/case-study/CaseStudyHero'
import ContactFooter from '@/components/case-study/ContactFooter'
import SectionHeading from '@/components/case-study/SectionHeading'
import UpNext from '@/components/case-study/UpNext'
import CarDoctorCinematic from '@/components/case-study/cardoctor/CarDoctorCinematic'
import CarDoctorHeroArt from '@/components/case-study/cardoctor/CarDoctorHeroArt'
import {
  contentFrame,
  readingFrame,
  textFrame,
} from '@/components/case-study/frame'
import { local, media } from '@/components/case-study/cardoctor/media'
import { deckIn } from '@/components/motion/deck'
import { workHref } from '@/lib/routes'

// Layout, type and colours follow the Framer export of /work/cardoctor (desktop values, with its
// tablet and mobile breakpoints folded into md/lg). Side padding around text switches at 810px, in step with
// the shared frame and hero.
const band = 'px-6 py-16 md:py-[120px] min-[810px]:px-20 xl:px-40'
const inner = textFrame
const body = `type-body text-body ${readingFrame}`
const statOrange = 'type-stat text-accent'
const caption = 'type-caption'
const card = 'rounded-[8px_40px_8px_8px] bg-mist p-4'

const sections: SectionNavItem[] = [
  { id: 'introduction', label: 'Introduction', children: [{ id: 'initial-problems', label: 'The initial problems' }] },
  {
    id: 'part-1',
    label: 'The "untrustworthy" UX',
    children: [
      { id: 'what-and-why', label: 'What and why' },
      { id: 'pov', label: 'PoV statement' },
    ],
  },
  { id: 'part-2', label: 'How the app was revamped', children: [{ id: 'features', label: 'Key features' }] },
  {
    id: 'part-3',
    label: 'Addressing the gaps',
    children: [
      { id: 'service-tracking', label: 'Real service tracking?' },
      { id: 'commission-bypass', label: 'Commission bypass' },
    ],
  },
  {
    id: 'part-4',
    label: 'Outcome',
    children: [
      { id: 'reception', label: 'Reception' },
      { id: 'challenges', label: 'Challenges' },
      { id: 'lessons', label: 'Lessons learned' },
    ],
  },
]

/** Short title on the left (30%, sticky where the source pins it), the story on the right. */
function Split({
  id,
  title,
  children,
  sticky = false,
  gap = 'gap-6',
}: {
  /** Anchor for the section nav; on the row, not the (possibly sticky) heading. */
  id?: string
  title: ReactNode
  children: ReactNode
  sticky?: boolean
  gap?: string
}) {
  return (
    <div id={id} className={`${inner} flex flex-col ${gap} lg:flex-row lg:items-start`}>
      <h3
        className={`type-topic z-[1] shrink-0 lg:w-[30%] ${
          sticky ? 'lg:sticky lg:top-16' : ''
        }`}
      >
        {title}
      </h3>
      <div className="flex min-w-0 flex-1 flex-col gap-10">{children}</div>
    </div>
  )
}

function Impact({ value, children }: { value: string; children: string }) {
  return (
    <div className="flex w-full flex-col gap-2">
      <p className="type-body text-ink">Impact:</p>
      <p className="type-stat">{value}</p>
      <p className={`${caption} w-3/4 text-muted`}>{children}</p>
    </div>
  )
}

function Feature({
  title,
  children,
  video,
  label,
}: {
  title: string
  children: ReactNode
  video?: string
  label?: string
}) {
  return (
    <div className="flex w-full flex-col gap-4 md:flex-row md:gap-20">
      <h4 className="type-topic md:flex-[0.5]">{title}</h4>
      <div className="flex min-w-0 flex-1 flex-col gap-8">
        <div className={`${body} space-y-3`}>{children}</div>
        {video && (
          <AutoplayVideo
            src={video}
            label={label ?? title}
            className="aspect-square w-full object-cover"
          />
        )}
      </div>
    </div>
  )
}

function Level({ number, question }: { number: number; question: string }) {
  return (
    <h3 className="w-full type-lede text-ink">
      <span className="text-accent">Level {number}:</span>
      <br />
      {question}
    </h3>
  )
}

function Shot({
  src,
  alt = '',
  className = '',
}: {
  src: string
  alt?: string
  className?: string
}) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={`w-full object-cover ${className}`}
    />
  )
}

function QuoteMark() {
  return (
    <svg
      viewBox="0 0 39 29"
      className="hidden h-auto w-12 md:block"
      aria-hidden="true"
    >
      <path
        fill="#F65009"
        d="M21.75 25.5V9C21.7525 6.61381 22.7015 4.32607 24.3888 2.63878C26.0761 0.951489 28.3638 0.00248174 30.75 0C31.1478 0 31.5294 0.158034 31.8107 0.439339C32.092 0.720643 32.25 1.10218 32.25 1.5C32.25 1.89782 32.092 2.27936 31.8107 2.56066C31.5294 2.84197 31.1478 3 30.75 3C29.1587 3 27.6326 3.63214 26.5074 4.75736C25.3821 5.88258 24.75 7.4087 24.75 9V10.5H36C36.7956 10.5 37.5587 10.8161 38.1213 11.3787C38.6839 11.9413 39 12.7044 39 13.5V25.5C39 26.2956 38.6839 27.0587 38.1213 27.6213C37.5587 28.1839 36.7956 28.5 36 28.5H24.75C23.9544 28.5 23.1913 28.1839 22.6287 27.6213C22.0661 27.0587 21.75 26.2956 21.75 25.5ZM3 28.5H14.25C15.0456 28.5 15.8087 28.1839 16.3713 27.6213C16.9339 27.0587 17.25 26.2956 17.25 25.5V13.5C17.25 12.7044 16.9339 11.9413 16.3713 11.3787C15.8087 10.8161 15.0456 10.5 14.25 10.5H3V9C3 7.4087 3.63214 5.88258 4.75736 4.75736C5.88258 3.63214 7.4087 3 9 3C9.39782 3 9.77936 2.84197 10.0607 2.56066C10.342 2.27936 10.5 1.89782 10.5 1.5C10.5 1.10218 10.342 0.720643 10.0607 0.439339C9.77936 0.158034 9.39782 0 9 0C6.61381 0.00248174 4.32607 0.951489 2.63878 2.63878C0.951489 4.32607 0.00248174 6.61381 0 9V25.5C0 26.2956 0.316071 27.0587 0.87868 27.6213C1.44129 28.1839 2.20435 28.5 3 28.5Z"
      />
    </svg>
  )
}

function UserQuote({
  avatar,
  width,
  aspect,
  quote,
  insight,
}: {
  avatar: string
  width: string
  aspect: string
  quote: string
  insight: string
}) {
  return (
    <figure className="flex flex-1 flex-row gap-6 md:flex-col md:gap-[5px]">
      <img
        src={avatar}
        alt=""
        loading="lazy"
        className={`h-auto shrink-0 object-contain ${width} ${aspect}`}
      />
      <div className="flex flex-col gap-[22px]">
        <QuoteMark />
        <blockquote className="type-body space-y-[19.5px] text-ink">
          <p>{quote}</p>
          <p>{insight}</p>
        </blockquote>
      </div>
    </figure>
  )
}

const features = [
  { id: 'f1', label: 'Search and Booking' },
  { id: 'f2', label: 'Service tracking' },
  { id: 'f4', label: 'Payment' },
  { id: 'f3', label: 'Emergency Assistance' },
  { id: 'f5', label: 'Maintenance guide' },
]

const lessons = [
  {
    title: 'Design for trust',
    text: "Early user testing showed that better search wouldn't help if users didn't believe the platform was reliable. We shifted our first sprint to focus entirely on credibility signals before discovery.",
    height: 'lg:h-[320px]',
  },
  {
    title: 'Creativity within constraints',
    text: "I found that the limitations we faced: technical, budget, or time - these tradeoffs really pushed me to think outside of the box and stick to what's important.",
    height: 'lg:h-[320px]',
  },
  {
    title: 'Design changes as startup grows',
    text: 'Lots of iterations were made. A startup’s needs can change quickly, so we need to stay flexible and adapt.',
    height: 'lg:h-[350px]',
  },
]

export default function CarDoctor() {
  // The cinematic covers the page on load; the header's entrance starts as it slides away.
  const [revealed, setRevealed] = useState(false)
  const reduced = useReducedMotion()

  return (
    <div className="overflow-x-clip bg-snow">
      <CarDoctorCinematic onOut={() => setRevealed(true)} />
      <ProjectNav />
      <SectionNav items={sections} />

      <CaseStudyHero
        title="CarDoctor"
        summary="Redesigning Vietnam's car service platform - turning a 70% drop-off rate into $1M in new revenue, and supporting it when it became backed by Vietnamese & Korean venture capitals."
        art={<CarDoctorHeroArt play={revealed} />}
        role="UX Designer"
        timelineLabel="Year"
        timeline="2024 - 2025"
        play={revealed}
      />

      <main>
        {/* Introduction */}
        <section
          aria-labelledby="introduction"
          className={`flex flex-col items-center gap-6 bg-white md:gap-10 xl:gap-16 ${band}`}
        >
          <h2 id="introduction" className={`${inner} type-section-title`}>
            Introduction
          </h2>
          <div className={`${inner} flex flex-col gap-10`}>
            <p className={body}>
              In Vietnam, vehicle maintenance is high-stress and low-trust:
              workshops operate in technical jargon, pricing is a hit or miss,
              and you don't know what happens when you hand them the car and
              your keys.
              <br />
              That's what CarDoctor aims to solve.
            </p>
            <p className={body}>
              During two four-month contracts in 2024 and 2025, I worked at
              CarDoctor, a Vietnam-based automotive technology startup,
              supporting its growth as it secured VC funding, expanded its B2B
              network, and connected vehicle owners, workshops, and partners.
            </p>
            <aside className={`${card} flex w-full flex-col gap-4 md:w-1/2`}>
              <svg
                viewBox="0 0 24 24"
                className="size-10 fill-none stroke-muted"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect
                  x="4.75"
                  y="4.75"
                  width="14.5"
                  height="14.5"
                  rx="4"
                  strokeWidth="1.5"
                />
                <path
                  d="M7.75 12.75s1.25 2.5 4.25 2.5 4.25-2.5 4.25-2.5"
                  strokeWidth="1.5"
                />
                <circle cx="10" cy="10" r="0.5" strokeWidth="1" />
                <circle cx="14" cy="10" r="0.5" strokeWidth="1" />
              </svg>
              <p className="type-quote text-graphite">Who I worked with:</p>
              <p className="type-body text-ink">
                I worked together with one STO (single-threaded owner), 4 other
                designers, 3 PMs, 3 business analysts, and 12 developers on this
                project.
              </p>
            </aside>
          </div>
          <Shot
            src={local.introduction}
            alt="CarDoctor app screens"
            className={`${inner} aspect-[1.47596]`}
          />
        </section>

        {/* The initial problems */}
        <section
          aria-labelledby="initial-problems"
          className={`flex flex-col items-center gap-6 bg-graphite md:gap-10 xl:gap-16 ${band}`}
        >
          <div className={`${inner} flex flex-col gap-8`}>
            <h2 id="initial-problems" className="type-topic text-white">
              The initial problems
            </h2>
            <p className={`type-body text-white ${readingFrame}`}>
              Initially, CarDoctor had a vendor/merchant service with B2B supply
              chains, and then it expanded with the purpose of connecting
              workshops and customers. The startup struggled to make revenue
              from their ecosystem from the consumer side. There were "a few"
              problems:
            </p>
          </div>
          <div className={`${inner} flex flex-col gap-16 md:flex-row`}>
            {[
              {
                label: 'Churn rate:',
                value: '70%',
                text: "which is quite a lot, considering how users can't find quickly which good garage to go to for their car.",
              },
              {
                label: 'Missed opportunities',
                value: '$50 - 100k',
                text: 'from user-side services, when the company was too focused on vendor relationships.',
              },
            ].map((item) => (
              <div key={item.value} className="flex flex-1 flex-col gap-3">
                <p className="type-body w-3/4 text-white">{item.label}</p>
                <p className={statOrange}>{item.value}</p>
                <p className={`${caption} w-3/4 text-white`}>{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Part 1 */}
        <section
          aria-labelledby="part-1"
          className="flex flex-col items-center gap-16 bg-white px-6 pt-16 pb-6 md:pt-[120px] min-[810px]:px-20 xl:px-40"
        >
          <div className={inner}>
            <SectionHeading
              id="part-1"
              eyebrow="— PART 1"
              title={'The "untrustworthy" UX'}
            />
          </div>
          <Split id="what-and-why" title="What and why">
            <div className="flex flex-col gap-20">
              <p className={`type-body text-ink ${readingFrame}`}>
                CarDoctor's premier consumer-facing product - the CarDoctor App,
                was weak in retaining customers.
              </p>
              <div className="flex flex-col gap-6">
                <p className={`${body} font-bold`}>
                  Major audit from Google Analytics:
                </p>
                <p className={statOrange}>7 / 10 users</p>
                <p className={`${caption} w-3/4 text-ink`}>
                  were dropping off from the home screen, hurting conversions
                  and new customer growth due to "untrustworthy" design
                </p>
                <Shot
                  src={local.research}
                  alt="Audit of the old CarDoctor home screen"
                  className="aspect-square rounded-xl"
                />
                <p className={`${caption} w-3/4 text-ink`}>
                  There were many functions shown to the user upfront and broken
                  flows. Also the second half of the homepage feels more like
                  marketing than offering any real service.
                </p>
              </div>
            </div>
          </Split>
        </section>

        {/* User interviews */}
        <section
          aria-label="User interviews"
          className="bg-white px-4 py-6 md:px-5 xl:px-10"
        >
          <div className="flex flex-col items-center gap-20 rounded-[19px] bg-[#f5f5f5] px-4 py-16 md:p-[60px] xl:p-[120px]">
            <div className={inner}>
              <div className={`${body} space-y-[19.5px]`}>
              <p>
                At the same time, I talked to a few users since this would be
                the fastest way to uncover why they were dropping off. I was
                also surprised to learn that there were even more problems that
                we hadn't thought of, and that also included trust issues with
                the app itself.
              </p>
              <p className="text-ink">
                I figured that the as-is product was focusing on selling repair
                services more than earning user trust first.
              </p>
              </div>
            </div>
            <div className={`${inner} flex flex-col gap-12 md:flex-row`}>
              <UserQuote
                avatar={media('avatarOverload')}
                width="w-[57px] md:w-[132px] xl:w-[181px]"
                aspect="aspect-[0.822727]"
                quote="Your service is good, but I find myself confused [...] too many things and I don’t even know where to start, it’s too hard to find something I need."
                insight="→ Cognitive overload"
              />
              <UserQuote
                avatar={media('avatarTransparency')}
                width="w-[57px] md:w-[113px] xl:w-[156px]"
                aspect="aspect-[0.707396]"
                quote="I don’t know what’s going on with my car, only way is to ring the workshop [...] your chat feature didn’t help much."
                insight="→ Transparency & communication issue"
              />
            </div>
          </div>
        </section>

        {/* PoV statement */}
        <section
          aria-labelledby="pov"
          className={`flex flex-col items-center bg-white ${band}`}
        >
          <div className={`${inner} flex flex-col gap-10`}>
            <h2 id="pov" className="type-topic">
              PoV Statement
            </h2>
            <div className="flex flex-col gap-6">
              <svg
                viewBox="0 0 16 16"
                className="size-12 fill-line md:size-16"
                aria-hidden="true"
              >
                <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.5a1 1 0 0 0-.8.4l-1.9 2.533a1 1 0 0 1-1.6 0L5.3 12.4a1 1 0 0 0-.8-.4H2a2 2 0 0 1-2-2zm7.194 2.766a1.7 1.7 0 0 0-.227-.272 1.5 1.5 0 0 0-.469-.324l-.008-.004A1.8 1.8 0 0 0 5.734 4C4.776 4 4 4.746 4 5.667c0 .92.776 1.666 1.734 1.666.343 0 .662-.095.931-.26-.137.389-.39.804-.81 1.22a.405.405 0 0 0 .011.59c.173.16.447.155.614-.01 1.334-1.329 1.37-2.758.941-3.706a2.5 2.5 0 0 0-.227-.4zM11 7.073c-.136.389-.39.804-.81 1.22a.405.405 0 0 0 .012.59c.172.16.446.155.613-.01 1.334-1.329 1.37-2.758.942-3.706a2.5 2.5 0 0 0-.228-.4 1.7 1.7 0 0 0-.227-.273 1.5 1.5 0 0 0-.469-.324l-.008-.004A1.8 1.8 0 0 0 10.07 4c-.957 0-1.734.746-1.734 1.667 0 .92.777 1.666 1.734 1.666.343 0 .662-.095.931-.26z" />
              </svg>
              <blockquote className="border-l-2 border-silver pb-10 pl-6 type-quote text-black">
                As a busy car owner, I need{' '}
                <strong>
                  a reliable platform that offers a comprehensive list of
                  trusted and verified mechanics and workshops, complete with
                  user reviews and ratings
                </strong>
                . This way, I can make informed decisions and avoid the hassle
                of searching for reliable service providers.
              </blockquote>
            </div>
          </div>
        </section>

        {/* Part 2 */}
        <section
          aria-labelledby="part-2"
          className={`flex flex-col items-center ${band}`}
        >
          <div className={inner}>
            <SectionHeading
              id="part-2"
              eyebrow="— PART 2"
              title="How the app was revamped"
            />
          </div>
        </section>

        <div
          className={`${contentFrame} flex items-start gap-4 py-6 md:gap-16 xl:gap-4`}
        >
          <Shot
            src={media('motionShowcase')}
            alt="CarDoctor app motion showcase"
            className="aspect-square w-px flex-[0.7]"
          />
          <Shot
            src={media('languageLoop')}
            alt="The app switching between Vietnamese and English"
            className="aspect-[0.5125] w-px flex-[0.3]"
          />
        </div>

        <section
          aria-labelledby="key-features"
          className="flex flex-col items-center gap-16 px-6 py-16 md:gap-[120px] md:pt-[120px] md:pb-20 min-[810px]:px-20 xl:px-[120px]"
        >
          <div className={`${textFrame} flex flex-col items-end gap-4`}>
            <Shot
              src={media('revampHero')}
              alt="The revamped CarDoctor app"
              className="aspect-[1.58672]"
            />
            <div className="w-full overflow-hidden rounded-2xl md:w-1/2">
              <AutoplayVideo
                src={media('revampWalkthrough')}
                label="Walkthrough of the revamped CarDoctor app"
                className="aspect-square w-full object-cover"
              />
            </div>
          </div>

          <Split id="features" title={<span id="key-features">Key features</span>} sticky>
            <div className="flex flex-col gap-6">
              <p className={`type-body text-ink ${readingFrame}`}>
                For the first revamp, I worked on defining the key visuals for
                the brand, since its messy visuals and broken flows led to
                eroded trust.
              </p>
              <p className={`type-body text-ink ${readingFrame}`}>
                Also, I focused on five forefront functionalities.
                <br />
                I've grouped these into 2 levels: building trust at first, and
                continuous customer service thereafter.
              </p>
              <nav
                aria-label="Key features"
                className="grid gap-2.5 sm:grid-cols-2"
              >
                {features.map((f) => (
                  <motion.a
                    key={f.id}
                    href={`#${f.id}`}
                    whileHover={{ backgroundColor: '#e6e6e6' }}
                    transition={{
                      type: 'spring',
                      duration: 0.45,
                      bounce: 0.25,
                    }}
                    className="rounded-xl bg-cloud p-4 type-body text-dim"
                  >
                    {f.label}
                  </motion.a>
                ))}
              </nav>
            </div>
          </Split>

          <div className={`${inner} flex flex-col items-center gap-16`}>
            <article
              id="f1"
              className="flex w-full scroll-mt-20 flex-col items-center gap-20 border-t border-line pt-8 pb-5 xl:pt-20 xl:pb-10"
            >
              <Level number={1} question="How do we build trust?" />
              <Shot
                src={media('levelOne')}
                alt="Level 1 screens: search, tracking and payment"
                className="aspect-[2.47]"
              />
              <Feature
                title="Search and Booking"
                video={media('searchBooking')}
              >
                <p>
                  Users had no structured way to compare workshops, and view
                  prices upfront…
                </p>
                <p>
                  I introduced a location-first discovery flow featuring
                  proximity, ratings, and services upfront. User research showed
                  trust was the main barrier, and testing confirmed a
                  search-first pattern created confusion.
                </p>
                <Impact value="+38%">conversion from search to booking</Impact>
              </Feature>
            </article>

            <article
              id="f2"
              className="flex w-full scroll-mt-20 flex-col gap-10 border-t border-line py-10"
            >
              <Feature
                title="Service Tracking"
                video={media('serviceTracking')}
              >
                <p>
                  Users had no visibility into what was happening to their car
                  after drop-off. This eroded trust for both sides. So the
                  assumption is:
                </p>
                <p>
                  I designed the tracking flow to provides real-time updates on
                  the milestones of the services. Users can monitor the progress
                  of their vehicle's repairs or maintenance from start to
                  finish.
                </p>
                <Impact value="-42%">
                  inbound calls from clients to workshops
                </Impact>
              </Feature>
            </article>

            <article
              id="f4"
              className="flex w-full scroll-mt-20 flex-col gap-10 border-t border-line py-10"
            >
              <Feature title="Payment" video={media('payment')}>
                <p>
                  In-app payment created anxiety for first-time users unfamiliar
                  with trusting a new platform.
                </p>
                <p>
                  I decided to make a fee breakdown screen before any payment
                  action, with itemized service cost, platform fee, total.
                  Payment methods limited to the few most-used in Vietnam to
                  avoid choice paralysis. The guarantee provided a peace of mind
                  to customers, and boosted more in-app payments.
                </p>
                <Impact value="+15%">
                  in-app payment and reduced abandonment
                </Impact>
              </Feature>
            </article>

            <article
              id="f3"
              className="flex w-full scroll-mt-20 flex-col items-center gap-20 border-t border-line pt-20 pb-10"
            >
              <Level
                number={2}
                question="How do we build lasting customer service?"
              />
              <Shot
                src={media('levelTwo')}
                alt="Level 2 screens: emergency assistance and maintenance guide"
                className="aspect-[2.72124]"
              />
              <Feature title="Emergency Assistance">
                <p>
                  When cars broke down, owners' first instinct was to call a
                  towing company. But, costs varied and availability was
                  unpredictable.
                </p>
                <p>
                  I found that cost comparison was the critical differentiator,
                  therefore when emergency assistance is needed, owners can
                  quickly see the service proximity and cost before deciding.
                </p>
                <Impact value="6.5 mins → <90 secs">
                  time-to-dispatch for emergency breakdown services
                </Impact>
              </Feature>
              <Shot
                src={media('emergency')}
                alt="Emergency assistance flow"
                className="aspect-[1.57714]"
              />
            </article>

            <article
              id="f5"
              className="flex w-full scroll-mt-20 flex-col items-center gap-20 border-t border-line py-10"
            >
              <Feature title="Service history & maintenance guide">
                <p>
                  Owners usually had manual record of past services (service
                  receipts) so a maintenance guide would be a "cherry on top"
                  providing preventive maintenance insights for car owners.
                </p>
                <p>
                  This also acts as a record for their bookkeeping and providing
                  customer information for each garage, so that any partner
                  within the CarDoctor network would know about the history of
                  their customers. Customers can also decide to share about
                  their car conditions or not.
                </p>
                <Impact value="+15%">
                  retention rate for workshops, with reminder bookings
                </Impact>
              </Feature>
              <Shot
                src={media('maintenance')}
                alt="Service history and maintenance guide screens"
                className="h-auto object-contain"
              />
            </article>
          </div>
        </section>

        {/* Part 3 */}
        <section
          aria-labelledby="part-3"
          className="flex flex-col items-center gap-16 bg-snow px-6 py-16 md:gap-[120px] md:py-[120px] min-[810px]:px-20 xl:px-[120px]"
        >
          <div className={inner}>
            <SectionHeading
              id="part-3"
              eyebrow="— PART 3"
              title="Addressing the gaps"
            />
          </div>
          <div className={inner}>
          <p className={body}>
            After the major iteration I set out to gather stakeholder and user
            feedbacks. There were a few gaps that I was able to address, mostly
            to the business perspectives.
          </p>
          </div>
          <Split id="service-tracking" title="Real service tracking?" sticky gap="gap-6 lg:gap-16">
            <div className={`${body} space-y-3`}>
              <p>
                Due to the nature of the technician's work, they would follow
                all steps at once and they will not manually update each stages.
                Low-level works aren't updated in real time, so it can be hard
                for the customers to know.
              </p>
              <p>
                I proposed that the app on the customer's side automatically
                estimates upcoming steps and notifies the client, to keep
                customers informed and reminds them of the services they
                ordered, while workshops simply mark tasks as "Done."
              </p>
            </div>
            <AutoplayVideo
              src={local.cardsCarousel}
              poster={local.cardsCarouselPoster}
              label="Status widgets cycling through ongoing services"
              className="aspect-[1.4] w-full object-cover"
            />
            <p className={`${caption} text-muted md:w-1/2`}>
              Some widgets that shows the car's status and other ongoing
              services to the client.
            </p>
          </Split>
          <Split id="commission-bypass" title="Commission bypass" sticky gap="gap-6 lg:gap-16">
            <div className={`${body} space-y-3`}>
              <p>
                This is the structurally largest and hardest one. Users find a
                garage on CarDoctor, then call them directly. The workshop has
                every incentive to encourage this and it cuts the commission.
                Unlike an on-demand service like Uber, the client usually
                doesn't have urgency and there are many choices.
              </p>
              <p>
                Also, culturally people like to pay{' '}
                <strong>after the service has been done</strong>, directly to
                the workshop.
              </p>
              <p>
                I raised this concern and addressed this as a "revenue leak" and
                came up with a hypothesis before I left - so this is still an
                open problem.
              </p>
            </div>
            <Shot
              src={media('commissionBypass')}
              alt="Commission bypass: how bookings leak out of the platform"
              className="aspect-[0.62963] md:w-[480px]"
            />
          </Split>
        </section>

        {/* Part 4 */}
        <section
          aria-labelledby="part-4"
          className="flex flex-col items-center gap-16 bg-snow px-6 py-16 md:gap-[120px] md:pt-20 md:pb-[60px] min-[810px]:px-20 xl:px-[120px]"
        >
          <div className={inner}>
            <SectionHeading id="part-4" eyebrow="— PART 4" title="Outcome" />
          </div>

          <Split id="reception" title="Reception" sticky>
            <p className={body}>
              CarDoctor achieved good retention rates, reflecting the app's
              ability to meet user needs effectively, which contributed to a $1M
              revenue increase by the end of 2025.
            </p>
            <div className="flex flex-col gap-3">
              <p className={statOrange}>$1 million</p>
              <p className={`${caption} w-3/4 text-muted`}>
                revenue from SaaS, vendor supply chain, assistance services, and
                in-app services.
              </p>
            </div>
            <p className={body}>
              In 2025, the company got VC-backed by{' '}
              <a
                href="https://nobleedgeeffect.com/"
                target="_blank"
                rel="noreferrer"
                className="text-accent underline-offset-4 hover:underline"
              >
                Noble Edge Effect
              </a>{' '}
              and{' '}
              <a
                href="https://www.titansventures.com/"
                target="_blank"
                rel="noreferrer"
                className="text-accent underline-offset-4 hover:underline"
              >
                Titans Ventures
              </a>
              , and expanded to other cities in Vietnam.
            </p>
            <div className="flex w-full items-center gap-10 md:w-1/2">
              <img
                src={media('vcNobleEdge')}
                alt="Noble Edge Effect"
                loading="lazy"
                className="aspect-[2] w-px flex-1 object-contain opacity-60 grayscale"
              />
              <img
                src={media('vcTitans')}
                alt="Titans Ventures"
                loading="lazy"
                className="aspect-[2.2619] w-px flex-1 object-contain opacity-60 grayscale"
              />
            </div>
          </Split>

          <Split id="challenges" title="Challenges" sticky>
            <div className={`${body} space-y-3`}>
              <p>
                One of the primary challenges was{' '}
                <strong>building user trust</strong> as a new platform,
                convincing owners to switch from their traditional methods of
                finding mechanics to using an app.
              </p>
              <p>
                We tackled this by giving out promotions to try out the
                services, with free vehicle inspection packages aimed at
                garages, with some cost involved. The service guarantees we
                offered eventually built trust with customers, with a 87%
                satisfaction rate.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <motion.img
                {...deckIn(0, 2, reduced)}
                src={media('promoWarranty')}
                alt="Promotion: Easy and convenience service warranty"
                loading="lazy"
                className="aspect-square w-px flex-1 object-cover brightness-[1.27] grayscale"
              />
              <motion.img
                {...deckIn(1, 2, reduced)}
                src={media('promoReturns')}
                alt="Promotion: Boost customer returns"
                loading="lazy"
                className="aspect-square w-px flex-1 object-cover brightness-[1.27] grayscale"
              />
            </div>
            <p className={`${caption} text-dim md:w-1/2`}>
              Some promotional images for our offerings. One -{' '}
              <em>"Easy and convenience service warranty"</em> and Two -{' '}
              <em>"Boost customer returns"</em>, aimed at customers and
              workshops.
            </p>
          </Split>

          <Split id="lessons" title="Lessons learned" sticky>
            <div className="grid items-start gap-2 md:grid-cols-2">
              {lessons.map((lesson, i) => (
                <motion.article
                  {...deckIn(i, lessons.length, reduced)}
                  key={lesson.title}
                  className={`${card} flex flex-col gap-4 lg:justify-between lg:gap-0 ${lesson.height}`}
                >
                  <h4 className="type-quote text-graphite">{lesson.title}</h4>
                  <p className="type-body text-ink">{lesson.text}</p>
                </motion.article>
              ))}
              <Shot
                src={media('lessons')}
                alt=""
                className="aspect-[0.773825] rounded-tr-[40px]"
              />
            </div>
          </Split>

          <div className={`${inner} flex flex-col gap-2`}>
            <svg
              viewBox="0 0 90 86"
              className="h-[86px] w-[90px]"
              aria-hidden="true"
            >
              <path
                fill="#FFC846"
                d="M 44.771 5.135 C 51.653 -4.91 67.371 0.205 67.023 12.366 C 78.486 8.297 88.205 21.667 80.788 31.293 C 92.46 34.734 92.46 51.266 80.788 54.707 C 88.205 64.356 78.486 77.726 67.023 73.634 C 67.348 85.795 51.63 90.91 44.771 80.865 C 37.888 90.91 22.17 85.795 22.519 73.634 C 11.056 77.703 1.337 64.333 8.754 54.707 C -2.918 51.266 -2.918 34.734 8.754 31.293 C 1.337 21.643 11.056 8.274 22.519 12.366 C 22.17 0.205 37.888 -4.91 44.771 5.135 Z"
              />
            </svg>
            <p className="type-eyebrow">
              — NOW THAT'S THE END
            </p>
            <h2 className="mt-2 type-display font-medium text-black">
              Thanks for reading!
            </h2>
          </div>
        </section>
      </main>

      <UpNext
        href={workHref('unblok')}
        title="Dream hacking to unlock creativity with Unblok and Apple Watch sensors"
        image={local.upNextUnblok}
      />
      <ContactFooter />
    </div>
  )
}
