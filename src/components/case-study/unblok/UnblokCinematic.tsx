import { generate } from '@/lib/generation/ui-generation'
import '@/lib/generation/generation.css'
import { asset } from '@/lib/asset'
import Cinematic from '../cardoctor/Cinematic'
import type { GenerateFn } from '../cardoctor/CarDoctorScreen'
import UnblokScreen from './UnblokScreen'

/** Stable across renders: the screen restarts its generation whenever this changes. */
const imageAsset = (name: string) => asset(`assets/images/${name}`)

/**
 * The image variant's build time. Its photo resolves from 68% to 92% of it, so at 2400ms the frame's zoom
 * (which starts at 74% of a region less 250ms, for 600ms) lands as the photo does. The screen reports the run
 * finished as soon as the photo is in, so the frame holds briefly and slides up, as Maximo's does.
 */
const BUILD = 2400

type UnblokCinematicProps = {
  /** The frame starts sliding up to show the page. */
  onOut?: () => void
  onDone?: () => void
}

/**
 * The Unblok loading curtain, on the same engine and timeline as CarDoctor's, CarDS's and Maximo's: it covers the
 * page on every load, retraces the iPhone and Apple Watch render as a white blueprint on dark (contours, halftone,
 * colour dots), zooms in as the photo resolves while the frame turns light, then slides up with the photo on it. Esc
 * or a click skips it; reduced motion gets a short fade.
 */
export default function UnblokCinematic({ onOut, onDone }: UnblokCinematicProps) {
  return (
    <Cinematic
      Screen={UnblokScreen}
      regions={1}
      regionDuration={BUILD}
      generate={generate as GenerateFn}
      asset={imageAsset}
      trigger="always"
      onOut={onOut}
      onDone={onDone}
    />
  )
}
