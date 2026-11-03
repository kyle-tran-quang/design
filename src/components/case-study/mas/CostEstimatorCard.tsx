import { useCallback, useRef, type CSSProperties } from 'react'
import ShadowHost from '@/components/ShadowHost'
import ScaleToFit from '@/components/ScaleToFit'
import CostEstimatorGeneration from './CostEstimatorGenerationStandalone'
// The runtime draws its blueprint overlay in the light DOM (the wrapper below), outside the
// shadow root, so the overlay styles have to be global.
import '@/lib/generation/generation.css'

// The accordion timings are declared on :root in the component's stylesheet, which
// doesn't reach into a shadow root; custom properties on the host do.
const accordionVars = {
  '--acc-expand': '250ms',
  '--acc-collapse': '250ms',
  '--acc-chevron': '250ms',
  '--acc-ease': 'cubic-bezier(0.22, 1, 0.36, 1)',
} as CSSProperties

/**
 * The Estimator's price summary card, exactly as exported from Framer
 * (CostEstimatorGenerationStandalone.tsx): drawn once as a dotted blueprint when it scrolls
 * into view, then revealed hi-fi. It's a picture of the product, not a working one: `inert`
 * takes it out of clicks, hover, focus and selection; screen readers get the one description
 * below. The blueprint is drawn inside the wrapper, so it scales and moves with the card.
 * Designed at 485px; on phones it scales down to fit instead of running off-screen
 * (its 42px price line doesn't wrap).
 */
export default function CostEstimatorCard() {
  const frameRef = useRef<HTMLDivElement>(null)
  const overlayParent = useCallback(() => frameRef.current, [])
  return (
    <div
      className="flex justify-center px-2"
      role="img"
      aria-label="Cost Estimator price summary: Essential maintenance modules, 175 users, and a monthly cost of EUR 3,678.98, with suggested questions below."
    >
      <div ref={frameRef} className="relative w-full max-w-[485px]" inert>
        <ScaleToFit width={485}>
          <ShadowHost style={accordionVars}>
            <CostEstimatorGeneration threshold={0.35} playOnce delay={0} overlayParent={overlayParent} />
          </ShadowHost>
        </ScaleToFit>
      </div>
    </div>
  )
}
