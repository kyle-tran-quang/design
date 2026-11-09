import { generate } from '@/lib/generation/ui-generation'
import '@/lib/generation/generation.css'
import { asset } from '@/lib/asset'
import Cinematic from '../cardoctor/Cinematic'
import type { GenerateFn } from '../cardoctor/CarDoctorScreen'
import { CINEMATIC } from '../cardoctor/cinematicCore'
import MGoatReportScreen from './MGoatReportScreen'

/**
 * The frame stays dark from the blueprint to the slide-up, because the report window is a dark-theme UI: the other
 * studies fade their frame to a light page colour, which would put a dark window on a light slab. The "light" colour
 * the engine fades to is therefore the same dark it starts from, so nothing visibly changes.
 */
const FRAME = CINEMATIC.dark

/** Stable across renders: the screen restarts its generation whenever this changes. */
const reportAsset = (name: string) => asset(`assets/mgoat/report/${name}`)

/**
 * The per-region build time. The report window is one busy component (a strip, two columns, eight meters, a tab panel),
 * so it takes the skill's default 2400ms rather than the 950ms the three-card screens use.
 */
const BUILD = 2400

type MGoatCinematicProps = {
  /** The frame starts sliding up to show the page. */
  onOut?: () => void
  onDone?: () => void
}

/**
 * The M-GOAT loading curtain, on the same engine and timeline as CarDoctor's, CarDS's, Maximo's, Unblok's and
 * Breadslice's: it covers the page on every load, draws the growth-roadmap report window (the story's report beat) as a
 * white blueprint on dark, zooms in as it turns hi-fi (the frame stays dark to suit the dark-theme UI), then slides up
 * onto the hero. Esc or a click skips it; reduced motion gets a short fade.
 */
export default function MGoatCinematic({ onOut, onDone }: MGoatCinematicProps) {
  return (
    <Cinematic
      Screen={MGoatReportScreen}
      regions={1}
      regionDuration={BUILD}
      generate={generate as GenerateFn}
      asset={reportAsset}
      dark={FRAME}
      light={FRAME}
      trigger="always"
      onOut={onOut}
      onDone={onDone}
    />
  )
}
