import { useState, type ReactNode } from 'react'
import { MotionConfig } from 'motion/react'
import KineticType from '@/components/KineticType'
import ProjectNav from '@/components/ProjectNav'
import SectionNav, { type SectionNavItem } from '@/components/case-study/SectionNav'
import CaseStudyHero from '@/components/case-study/CaseStudyHero'
import ContactFooter from '@/components/case-study/ContactFooter'
import SectionHeading from '@/components/case-study/SectionHeading'
import Stat from '@/components/case-study/Stat'
import Ticket from '@/components/case-study/Ticket'
import TopicRow from '@/components/case-study/TopicRow'
import UpNext from '@/components/case-study/UpNext'
import Feature from '@/components/case-study/unblok/Feature'
import UnblokCinematic from '@/components/case-study/unblok/UnblokCinematic'
import { contentFrame, readingFrame } from '@/components/case-study/frame'
import Reveal from '@/components/motion/Reveal'
import type { ScrollPreset } from '@/components/motion/presets'
import { asset } from '@/lib/asset'
import { workHref } from '@/lib/routes'

// Images not yet copied into public/ are still served from Framer's CDN.
const framerImage = (id: string, ext = 'png', size = 1024) =>
  `https://framerusercontent.com/images/${id}.${ext}?scale-down-to=${size}`
const video = (name: string) => asset(`assets/videos/unblok-${name}.mp4`)

const container = contentFrame
const rule = <hr className="border-line" />

/** The Concept section's steps: their headings double as the section nav's sub-entries. */
const steps = {
  session: { id: 'set-session', title: 'Set a session or choose a technique on iPhone' },
  vitals: { id: 'vitals-prompt', title: 'The watch reads your vitals, while prompt is spoken' },
  capture: { id: 'idea-capture', title: 'Idea capture upon waking' },
  journal: { id: 'sessions-journal', title: 'Sessions, insights and journal' },
}

const sections: SectionNavItem[] = [
  { id: 'inspiration', label: 'The inspiration' },
  {
    id: 'concept',
    label: 'Concept',
    children: Object.values(steps).map(({ id, title }) => ({ id, label: title })),
  },
  {
    id: 'process',
    label: 'Behind the scenes',
    children: [
      { id: 'alone', label: "But what if we're alone?" },
      { id: 'aha', label: 'The aha moment' },
      { id: 'challenge', label: 'The challenge' },
      { id: 'users', label: 'Checking it with users' },
      { id: 'scratchpad', label: 'Scratchpad ideas' },
      { id: 'takeaways', label: 'Key takeaways' },
    ],
  },
]

type ShotProps = {
  src: string
  alt?: string
  /** Aspect ratio class for the image, e.g. `aspect-square`. */
  aspect: string
  /** Corner and border treatment for the image. */
  frame?: string
  /** Layout classes for the animated wrapper (margins, grid placement). */
  className?: string
  preset?: ScrollPreset
}

function Shot({ src, alt = '', aspect, frame = 'rounded-lg', className, preset = 'rise' }: ShotProps) {
  return (
    <Reveal preset={preset} className={className}>
      <img src={src} alt={alt} loading="lazy" className={`w-full bg-mist object-cover ${frame} ${aspect}`} />
    </Reveal>
  )
}

function Credit({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`type-caption text-dim ${className}`}>{children}</p>
}

/** Ticket stub icons (Figma 14:250, 14:258, 14:262) at their exported size; Ticket draws them at 2x. */
const ticketIcons = {
  sleep: { src: asset('assets/b2fbc.svg'), width: 80, height: 81 },
  devices: { src: asset('assets/55612.svg'), width: 85, height: 80.4609 },
  alarm: { src: asset('assets/c44f1.svg'), width: 120, height: 80 },
}

export default function Unblok() {
  // The cinematic covers the page on load; the header's entrance starts as it slides away.
  const [revealed, setRevealed] = useState(false)

  return (
    // Framer honours the OS "reduce motion" setting; so do these effects.
    <MotionConfig reducedMotion="user">
      <div className="overflow-x-clip bg-snow">
        <UnblokCinematic onOut={() => setRevealed(true)} />
        <ProjectNav />
        <SectionNav items={sections} />

        <CaseStudyHero
          title="Dream hacking to unlock creativity with Unblok"
          summary="Unblok is a creative-block tool for iPhone and Apple Watch. It uses the edge of sleep to help you find ideas with a simple interface bound together by complex algorithms."
          image={asset('assets/images/unblok-hero.webp')}
          role="Product Designer"
          timelineLabel="Year"
          timeline="2025"
          play={revealed}
        />

        <main>
          {/* The inspiration */}
          <section aria-labelledby="inspiration" className="bg-white pt-20 pb-24 lg:pt-[120px] lg:pb-[150px]">
            <div className={container}>
              <SectionHeading id="inspiration" eyebrow="— THE INSPIRATION" title="Dream hacking" />

              <div className={`mt-16 space-y-8 type-body text-body lg:mt-[120px] ${readingFrame}`}>
                <p>
                  We all have creative blocks, and it rarely helps by trying harder at creating, especially if you're
                  burned out. The state that might help is the one we skip, hypnagogia (a really cool word indeed) - the
                  moment before sleep when your thinking turns loose and associative.
                </p>
                <p>
                  In a 2023 study, people who napped with a guided dream topic scored 43% higher on creativity measures
                  than people who napped without one. They scored 78% higher than people who stayed awake (
                  <a
                    href="https://www.media.mit.edu/posts/dreams-and-creativity/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent underline-offset-4 hover:underline"
                  >
                    MIT Media Lab
                  </a>
                  ). But it takes a lab and custom-built hardware, which includes a glove with various sensors, a
                  computer, a pair of speakers and some open-source software that the researchers have released to
                  control these interfaces.
                </p>
              </div>

              <div className="mt-16 lg:mt-[120px]">
                <div className="grid items-end gap-6 sm:grid-cols-2">
                  <Shot
                    src={asset('assets/images/unblok-body-1.avif')}
                    alt="The Dormio sensor glove from MIT Media Lab"
                    aspect="aspect-[900/601]"
                  />
                  <Shot
                    src={asset('assets/images/unblok-body-2.webp')}
                    alt="A participant sleeping while wearing the Dormio setup"
                    aspect="aspect-[1400/784]"
                  />
                </div>
                <Credit className="mt-6">Photo courtesy by MIT.</Credit>
              </div>

              <h3 className="mt-24 max-w-[800px] type-lede text-black lg:mt-[160px]">
                <span className="block text-muted">Then I had a question:</span>
                Could this work on devices people already own?
              </h3>
            </div>
          </section>

          {/* Concept */}
          <section aria-labelledby="concept" className="pt-20 pb-24 lg:pt-[120px] lg:pb-[160px]">
            <div className={container}>
              <SectionHeading id="concept" eyebrow="— CONCEPT" title="Interfacing dream with iOS & Apple Watch" />

              <div className="mt-16 py-10 type-lede text-black lg:mt-20 lg:py-20">
                <p>
                  {'Introducing '}
                  <span className="text-[#fa8237]">Unblok —</span>
                </p>
                <p className="pt-2">
                  Capturing when you fall into hypnagogia, speaking the prompts softly, and helping you get the idea
                  you're trying to solve.
                </p>
                {/* One blank line above, as in the design. */}
                <p className="mt-[1.2em]">All with the help of science.</p>
              </div>

              <div className="mt-20 space-y-24 lg:mt-[140px] lg:space-y-[200px]">
                <Feature
                  id={steps.session.id}
                  step={1}
                  title={steps.session.title}
                  video={video('set-session')}
                  videoLabel="Choosing a session and a prompt in the Unblok iPhone app"
                >
                  <p>
                    On iPhone, choose a session, or use/choose what you're stuck on or pick from the library prompts,
                    such as "I need to find some ideas for my final solution about Irish health services" to sleep with
                    it.
                  </p>
                </Feature>

                <Feature
                  id={steps.vitals.id}
                  step={2}
                  title={steps.vitals.title}
                  video={video('vitals-prompt')}
                  videoLabel="Apple Watch reading heart rate and movement during a session"
                  squareVideo
                  after={
                    <>
                      <Shot
                        src={asset('assets/ef891.png')}
                        alt="iPhone playing an audio prompt while the Watch tracks sleep onset"
                        aspect="aspect-[2400/1223]"
                        frame="border border-line"
                        preset="fade"
                      />
                      <p className={readingFrame}>
                        During the session, the phone (or connected headphones) reads out and facilitates audio prompts
                        based on the blockage subject for you, aiming to have that prompt stick around in your mind as
                        you doze off. This will eventually influence what you think about subconsciously.
                      </p>
                    </>
                  }
                >
                  <p>
                    Once a session starts, the Watch is synced and reads your heart rate, wrist tension, movements and
                    breath rate in real time, somewhat same as the original Dormio glove used with no extra hardware.
                  </p>
                </Feature>

                <Feature
                  id={steps.capture.id}
                  step={3}
                  title={steps.capture.title}
                  video={video('idea-capture')}
                  videoLabel="Dictating an idea on Apple Watch after a gentle haptic wake-up"
                >
                  <p>
                    At the N2 sleep stage boundary, a gentle haptic pattern on the Watch wakes you before hypnagogia
                    dissolves. You type or dictate in whatever comes on your mind at this very quick moment, before you
                    forget about it, then your idea is saved and synced to your Journals on iPhone.
                  </p>
                </Feature>

                <div>
                  <Feature
                    id={steps.journal.id}
                    step={4}
                    title={steps.journal.title}
                    video={video('sessions-journal')}
                    videoLabel="Browsing past sessions and captured ideas in the Unblok journal"
                  >
                    <p>
                      Every capture lands in the Journal, time-stamped and tied to the session it came from. You can
                      scroll back through past sessions in full, and machine learning predicts your sleep patterns
                      better over time.
                    </p>
                  </Feature>
                  <Shot
                    src={asset('assets/bf962.png')}
                    alt="Unblok screens for sessions, sleep insights and the journal"
                    aspect="aspect-[7/4]"
                    frame="rounded-[20px]"
                    preset="fade"
                    className="mt-16 lg:mt-20"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Research and process */}
          <section aria-labelledby="process" className="bg-white pt-20 pb-16 lg:pt-[120px] lg:pb-[120px]">
            <div className={container}>
              <SectionHeading id="process" eyebrow="— RESEARCH, PROCESS, AND NERD STUFF" title="Behind the scenes" />
              <div className={`mt-16 space-y-6 type-body text-body lg:mt-[120px] ${readingFrame}`}>
                <p>
                  For Unblok, it was a dissertation project in my master's of design at Maynooth. I was in my own kind
                  of creative block as I was stuck thinking about what to write my dissertation on, and trying to define
                  the real problem that I needed to solve.
                </p>
                <p>
                  Normally, folks would be using using sticky notes and whiteboards (the only design thinking tool you
                  need!), or attending workshops facilitated by someone else. Still, the most effective way is to have a
                  conversation with someone to gain new perspectives.
                </p>
              </div>

              <div id="alone" className="mt-20 flex flex-col gap-10 md:flex-row md:items-start md:gap-4 lg:mt-[120px]">
                <div className="flex flex-col gap-12 pt-6 md:min-w-0 md:flex-[437_0_0]">
                  <div className="border-l-8 border-[#fa8237] pl-6 type-quote text-ink">
                    <h3>But…what if we're alone?</h3>
                    <p>Introverted?</p>
                    <p>Shy?</p>
                    <p>Working independently or as a freelancer?</p>
                    <p className="mt-[1.4em] text-[#fa8237]">It would be a little bit harder.</p>
                  </div>
                  <p className="type-caption text-ink">Comics by Sarah Andersen.</p>
                </div>
                <Reveal preset="rise" className="max-w-[420px] md:max-w-none md:min-w-0 md:flex-[547_0_0]">
                  <img
                    src={asset('assets/9c009.png')}
                    alt="Comic about an introvert struggling to ask for help"
                    loading="lazy"
                    className="aspect-[503/755] w-full rounded-[20px] object-cover"
                  />
                </Reveal>
              </div>

              <p className="mt-24 max-w-[800px] type-lede text-black lg:mt-[140px]">
                So that became my brief: build something simple, personal and useful for one individual.
              </p>
              <Shot
                src={framerImage('k7eSnPJnLGrXLzKCRRA8Gbf1O8', 'png', 2048)}
                alt="Research synthesis for the Unblok brief"
                aspect="aspect-[2025/978]"
                preset="fade"
                className="mt-16 lg:mt-[100px]"
              />

              <div className="mt-20 lg:mt-[110px]">{rule}</div>

              <TopicRow id="aha" title="The aha moment:" label="wide" sticky className="mt-20 lg:mt-[120px]">
                <h4 className="type-subtopic text-black">MIT's Dormio research</h4>
                <div className={`mt-6 space-y-6 type-body text-body ${readingFrame}`}>
                  <p>
                    I came across MIT's Dormio - a sleep hacking study while doing the secondary research. Initially I
                    thought of a safe path - a facilitated app that works like Headspace but for creativity, and you only
                    need a phone (see scratchpad below).
                  </p>
                  <p>
                    The idea is inspired by how we sleep - during sleep onset, a strange introspective window arises in
                    the form of hypnagogia, a semi-lucid sleep state where we all begin dreaming before we fall fully
                    unconscious. Hypnagogia is characterized by experiential unpredictability, distorted perception of
                    space and time, and spontaneous, fluid idea association.
                  </p>
                  <p>
                    Edison, Tesla, Poe, and Dalí each accessed this state by napping with a steel ball in hand to capture
                    creative ideas generated in hypnagogic microdreams when it dropped to the floor below...
                  </p>
                </div>
                <Reveal preset="quote" className="mt-10 rounded-[20px] bg-snow p-6 lg:p-8">
                  <p className="type-quote text-accent">"Targeted dream incubation" concept by MIT</p>
                  <p className="mt-5 type-body text-body">
                    This uses sensory cues such as sounds, to steer dreams toward specific topics, followed by timed
                    awakenings to record what the sleeper experienced.
                  </p>
                </Reveal>
                <Shot
                  src={framerImage('gmVX9nwElg9L2E7EzBgM2Aj4NU')}
                  alt="Diagram of MIT's targeted dream incubation protocol"
                  aspect="aspect-[1400/1094]"
                  className="mt-10"
                />
                <Credit className="mt-6">Photo courtesy by MIT.</Credit>
              </TopicRow>

              <div className="mt-20 lg:mt-[110px]">{rule}</div>

              <TopicRow id="challenge" title="The challenge:" label="wide" sticky className="mt-20 lg:mt-[120px]">
                <div className={`space-y-6 type-body text-body ${readingFrame}`}>
                  <p>
                    The difference from MIT's version is the hardware. Dormio reads muscle tone, heart rate and skin
                    conductance through a glove.
                  </p>
                  <p>
                    I narrowed that to heart rate, breath and wrist motion, the three signals that Apple Watch gives
                    reliably given today's latest hardware, and this is also the constraint, as it doesn't detect fingers
                    muscle tension like Dormio does hence reduced accuracy.
                  </p>
                </div>
                <div className="mt-10 grid items-end gap-6 sm:grid-cols-2">
                  <Shot src={framerImage('WGR2kkVaUV1UUS0xBp4y9jvw')} alt="Dormio glove sensors" aspect="aspect-[1024/672]" />
                  <Shot
                    src={framerImage('4LtD3SH4g6G29K284O3ACJsSVsw')}
                    alt="Dormio signal readings during sleep onset"
                    aspect="aspect-[1124/746]"
                  />
                </div>
                <Credit className="mt-6">Photo courtesy by MIT.</Credit>

                <h4 className="mt-[70px] type-subtopic text-black">Feasible design decisions:</h4>
                {/* The tickets lie on a table; it shows through their notches. */}
                <div className="mt-10 grid justify-items-center gap-10 rounded-[28px] bg-[#f5f5f1] px-6 py-10 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-6 sm:px-8 sm:py-12">
                  <Ticket title="Sleep rules" accent="coral" icon={ticketIcons.sleep} className="max-w-[340px] -rotate-2">
                    One decision that I made was based on understandable sleep science: N1 stage triggers when heart rate
                    drops by 5 bpm alongside 45s of stillness; N2 has an 8 bpm drop and 60s of stillness. And it's easy
                    to capture that with the watch sensors.
                  </Ticket>
                  <Ticket
                    title="One job per device."
                    accent="periwinkle"
                    icon={ticketIcons.devices}
                    className="max-w-[340px] rotate-[1.5deg] sm:mt-12"
                  >
                    The Apple Watch serves as the edge-detection trigger, signaling the bedside iPhone to play
                    pre-recorded incubation prompts at a calibrated, gentle volume the moment physiological N1 thresholds
                    are crossed.
                  </Ticket>
                  <Ticket
                    title="Awakening"
                    accent="sun"
                    icon={ticketIcons.alarm}
                    className="max-w-[340px] rotate-1 sm:col-span-2 sm:w-[calc(50%-12px)] sm:-translate-x-[8%]"
                  >
                    Combine Apple Watch haptics with ambient iPhone audio capture. Haptic vibration rouses the sleeper
                    just enough to prompt recall and opens the microphone to record their verbal response.
                  </Ticket>
                </div>
              </TopicRow>

              <div className="mt-20 lg:mt-[110px]">{rule}</div>

              <TopicRow id="users" title="Checking it with users" label="wide" sticky className="mt-20 lg:mt-[120px]">
                <h4 className="type-subtopic text-black">People said that they got at least one idea!</h4>
                <p className={`mt-6 type-body text-body ${readingFrame}`}>
                  After building, I tested with 5 designer friends who owned the iPhone and Apple Watch pair.
                </p>
                <div className="mt-10 grid gap-8 sm:grid-cols-2">
                  <Stat value="3 of 5">woke up with at least one idea.</Stat>
                  <Stat value="2 of 5">said they got good ones that solved their problem.</Stat>
                </div>
              </TopicRow>

              {/* The test user's words get the full frame: a pause between the stats and the test photos. */}
              <figure className="mt-24 max-w-[880px] lg:mt-[160px]">
                <span
                  aria-hidden="true"
                  className="-mb-6 block text-[120px] leading-none text-accent select-none lg:-mb-12 lg:text-[200px]"
                >
                  “
                </span>
                <blockquote className="type-lede text-ink">
                  <p>
                    It was like, I had to try several times…but then it worked like a charm. I was able to figure out
                    what I was missing, part of me being refreshed and another thanking the app for letting me record
                    it right away!”
                  </p>
                </blockquote>
                <figcaption className="mt-8 type-caption text-dim lg:mt-10">— A test user</figcaption>
              </figure>

              <Shot
                src={framerImage('3wEBSjJAO8KCGZK6i25APSUm8s', 'png', 2048)}
                alt="Usability test notes"
                aspect="aspect-[2507/1536]"
                className="mt-24 lg:mt-[160px]"
              />
              <div className="mt-6 grid items-end gap-6 sm:grid-cols-2">
                <Shot
                  src={framerImage('nJpIDaLr8uHdUE1K3c5tprCGpTU', 'jpeg')}
                  alt="A tester using Unblok on Apple Watch"
                  aspect="aspect-square"
                />
                <Shot
                  src={framerImage('67fBhZluRKWHeM3y4nCDOx0C8fQ')}
                  alt="Ideas captured by testers in the journal"
                  aspect="aspect-[1956/1500]"
                />
              </div>

              <div className="mt-20 lg:mt-[110px]">{rule}</div>

              <TopicRow
                id="scratchpad"
                title={'Scratchpad ideas before the "Aha":'}
                label="wide"
                sticky
                className="mt-20 lg:mt-[120px]"
              >
                <h4 className="type-subtopic text-black">Unblok Facilitator</h4>
                <div className={`mt-6 space-y-6 type-body text-body ${readingFrame}`}>
                  <p>
                    The other idea that I had before coming across dream incubation was to address a problem as the user
                    uses AI to solve creative block, and most general chatbots are designed to agree with you and doesn't
                    help you think critically and grow.
                  </p>
                  <p>
                    So, my former approach was building 'Putty' (as our mascot and the AI partner) with a creative
                    technique library, and acts as a non-judgmental AI sparring partner designed to be a critic, asking
                    you probing questions.
                  </p>
                  <p>
                    And the user can document their daily creative thoughts and ideas using the built in journal, both
                    during or outside of sessions, as well as log their ideas as they spar with Putty.
                  </p>
                </div>
                <div className="mt-10 grid gap-2 sm:grid-cols-2">
                  <Shot src={framerImage('qYJqF7BWlQxsxFesM8A2ww')} alt="Putty, the AI sparring partner mascot" aspect="aspect-square" />
                  <Shot src={framerImage('ItSBROmOrrfRZjtU0OX0cfR0wA')} alt="Creative technique library screens" aspect="aspect-square" />
                  <Shot
                    src={framerImage('Ji3vIgrEXsgnWdqwTdCxSlC7g8')}
                    alt="Sparring session with Putty"
                    aspect="aspect-video"
                    className="sm:col-span-2"
                  />
                  <Shot src={framerImage('LJWDkjjWUbJAb8jM5Z9TNV1c')} alt="Journal screens from the facilitator concept" aspect="aspect-square" />
                  <Shot src={framerImage('iHMRRTuCcV220myYTChSRTHpyA', 'gif', 1000)} alt="Putty animation" aspect="aspect-square" />
                </div>
              </TopicRow>

              <div className="mt-20 lg:mt-[110px]">{rule}</div>

              <TopicRow id="takeaways" title="Key takeaways" label="wide" sticky className="mt-20 lg:mt-[120px]">
                <div className={`space-y-6 type-body text-body ${readingFrame}`}>
                  <p>
                    One thing I want to point out is that Unblok doesn't work every time. Success depends on many things
                    we can't control, like how tired someone is, how fast they fall asleep and how well they remember a
                    thought on waking. As we're human and sleep isn't a switch, Unblok aims to improve the odds of
                    catching an idea.
                  </p>
                  <p>
                    This has been a very fun project for me to explore when working on my thesis and looking back, I
                    really wish I had more time to experiment with more things and getting access to more immersive
                    hardware for these experiences.
                  </p>
                </div>
                <div className="mt-10 grid items-end gap-6 sm:grid-cols-2">
                  <Shot src={framerImage('evkLeXcIXBNvpP1eLK5sTRdu3Y')} alt="Unblok on Apple Watch" aspect="aspect-[1340/1458]" />
                  <Shot src={framerImage('hi2qXUMp0SDAi6xF5g7BCgcT3Y')} alt="Unblok on iPhone" aspect="aspect-[2436/2060]" />
                </div>
                <p className="mt-14 type-subtopic text-black">
                  For anyone curious, I used Cursor & Xcode to build Unblok with SwiftUI!
                </p>
                <Shot
                  src={framerImage('8dPf8mz75Fw5O3PkmjpXFckbjGM', 'png', 2048)}
                  alt="Unblok's SwiftUI project open in Xcode"
                  aspect="aspect-[2740/2164]"
                  className="mt-10"
                />
              </TopicRow>

              <div className="mt-24 lg:mt-[110px]">
                <p className="type-eyebrow">— NOW THAT'S THE END</p>
                <h2 className="mt-2 type-display font-medium text-black">
                  <KineticType text="Thanks for reading!" />
                </h2>
              </div>
            </div>
          </section>
        </main>

        <UpNext
          href={workHref('cardoctor-ds')}
          title="Transforming CarDoctor's Design System for 2x agility within 4 months"
          image={asset('assets/images/home-readmore-card-cardoctor-ds.avif')}
        />
        <ContactFooter />
      </div>
    </MotionConfig>
  )
}
