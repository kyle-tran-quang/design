import { generate } from '@/lib/generation/ui-generation'
import '@/lib/generation/generation.css'
import './cardoctor.css'
import Cinematic from './Cinematic'
import type { GenerateFn } from './CarDoctorScreen'
import { cinematicAsset } from './media'

type CarDoctorCinematicProps = {
  /** The frame starts sliding up to show the page. */
  onOut?: () => void
  onDone?: () => void
}

/**
 * The CarDoctor loading curtain, as the Framer component plays it on the site: it covers the page on every
 * load, draws the three cards as a white blueprint on dark, zooms to 70% as they turn hi-fi, then slides up.
 * Esc or a click skips it.
 */
export default function CarDoctorCinematic({
  onOut,
  onDone,
}: CarDoctorCinematicProps) {
  return (
    <Cinematic
      generate={generate as GenerateFn}
      asset={cinematicAsset}
      trigger="always"
      onOut={onOut}
      onDone={onDone}
    />
  )
}
