import { useEffect } from 'react'
import { MotionConfig } from 'motion/react'
import ProjectNav from '@/components/ProjectNav'
import ContactFooter from '@/components/case-study/ContactFooter'
import UpNext from '@/components/case-study/UpNext'
import ChapterRail from '@/components/case-study/mgoat/ChapterRail'
import MGoatHero from '@/components/case-study/mgoat/MGoatHero'
import '@/components/case-study/mgoat/styles'
import { asset } from '@/lib/asset'
import { workHref } from '@/lib/routes'

/** One label per rail chapter, in order. Keep in step with `STORY.chapters` and each beat's `chapter` in engine/story.js. */
const CHAPTERS = [
  'Maximo',
  'The learning curve',
  'The opportunity',
  'The goal',
  'Capabilities',
  'Milestones and simulator',
  'The first iteration',
  'The second iteration',
  'Fewer questions',
  'The report',
  'Value of expansion',
  'Maturity maps',
]

/**
 * M-GOAT case study: a scroll-driven scene. The hero pins and morphs into a split layout (stage on the left, story on
 * the right); the engine in components/case-study/mgoat/engine owns everything inside #scene and #text.
 *
 * The engine builds DOM and attaches window listeners, so the page starts it once its markup exists and stops it on the
 * way out. `startMGoat()` returns the stop function; React's dev double-mount (start, stop, start) is therefore safe,
 * and so is leaving for another case study and coming back.
 */
export default function MGoat() {
  useEffect(() => {
    let stop: (() => void) | undefined
    let cancelled = false
    // Loaded here, not at the top, so the ~400KB engine is only fetched for this route and runs once the markup exists.
    import('@/components/case-study/mgoat/engine').then(({ startMGoat }) => {
      if (!cancelled) stop = startMGoat()
    })
    return () => {
      cancelled = true
      stop?.()
    }
  }, [])

  return (
    // `overflow-x-clip`, like every case study page: unlike `hidden` it does not make the wrapper a scroll container,
    // so the pinned hero and the sticky stage column keep working.
    <MotionConfig reducedMotion="user">
      <div className="mg-root overflow-x-clip bg-white">
        <ProjectNav />
        <MGoatHero />
        <div className="intro-under" id="introUnder" aria-hidden="true">
          <div className="u-stage">
            <div id="underScene" style={{ width: '100%', height: '100%' }} />
          </div>
          <div className="u-col text-col" id="underCol" />
        </div>
        <div className="layout pre-intro" id="layout" data-theme="light">
          <div className="stage-col">
            <div id="scene" style={{ width: '100%', height: '100%' }} />
          </div>
          <div className="text-col" id="text" />
        </div>
        <ChapterRail chapters={CHAPTERS} />
        <UpNext
          href={workHref('mas-pricing')}
          title="Giving IBM Maximo sellers the control they need to cut 30% deal time"
          image={asset('assets/images/home-works-card-mas-pricing.avif')}
        />
        <ContactFooter />
      </div>
    </MotionConfig>
  )
}
