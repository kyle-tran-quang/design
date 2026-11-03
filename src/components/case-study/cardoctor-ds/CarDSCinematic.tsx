import { generate } from '@/lib/generation/ui-generation'
import '@/lib/generation/generation.css'
import { asset } from '@/lib/asset'
import './carDS.css'
import Cinematic from '../cardoctor/Cinematic'
import type { GenerateFn } from '../cardoctor/CarDoctorScreen'
import CarDSScreen from './CarDSScreen'

/** The header art's own background, so the finished screen sits on it exactly as in the image. */
const CANVAS = '#FAFAFA'

/** Stable across renders: the screen restarts its generation whenever this changes. */
const imageAsset = (name: string) => asset(`assets/images/${name}`)

type CarDSCinematicProps = {
  /** The frame starts sliding up to show the page. */
  onOut?: () => void
  onDone?: () => void
}

/**
 * The CarDS loading curtain, on the same engine and timeline as CarDoctor's and Maximo's: it covers the page on every
 * load, draws the six cards of the header art as a white blueprint on dark, zooms in as they turn hi-fi while the
 * frame turns to the art's #FAFAFA, then slides up. Esc or a click skips it; reduced motion gets a short fade.
 */
export default function CarDSCinematic({ onOut, onDone }: CarDSCinematicProps) {
  return (
    <Cinematic
        Screen={CarDSScreen}
        // Six cards, 160ms apart, so the whole morph lands about as fast as CarDoctor's three.
        regions={6}
        stagger={160}
        generate={generate as GenerateFn}
        asset={imageAsset}
        light={CANVAS}
        trigger="always"
        onOut={onOut}
        onDone={onDone}
      />
  )
}
