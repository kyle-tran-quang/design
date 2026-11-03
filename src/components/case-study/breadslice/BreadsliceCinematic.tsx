import { generate } from '@/lib/generation/ui-generation'
import '@/lib/generation/generation.css'
import { asset } from '@/lib/asset'
import Cinematic from '../cardoctor/Cinematic'
import type { GenerateFn } from '../cardoctor/CarDoctorScreen'
import BreadsliceScreen from './BreadsliceScreen'

/** Stable across renders: the screen restarts its generation whenever this changes. */
const imageAsset = (name: string) => asset(`assets/images/${name}`)

/**
 * The image variant's build time, as Unblok's. Its image resolves from 64% to 88% of it, so at 2400ms the frame's
 * zoom (which starts at 74% of a region less 250ms, for 600ms) lands exactly as the image does.
 */
const BUILD = 2400

type BreadsliceCinematicProps = {
  /** The frame starts sliding up to show the page. */
  onOut?: () => void
  onDone?: () => void
}

/**
 * The Breadslice loading curtain, on the same engine and timeline as CarDoctor's, CarDS's, Maximo's and Unblok's: it
 * covers the page on every load, retraces the hero image's three app screens as a white blueprint on dark (contours,
 * halftone, colour dots), zooms in as the image resolves while the frame turns light, then slides up onto the same
 * image in the hero. Esc or a click skips it; reduced motion gets a short fade.
 */
export default function BreadsliceCinematic({ onOut, onDone }: BreadsliceCinematicProps) {
  return (
    <Cinematic
      Screen={BreadsliceScreen}
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
