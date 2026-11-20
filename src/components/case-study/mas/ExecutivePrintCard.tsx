import { useState } from 'react'
import ShadowHost from '@/components/ShadowHost'
import ExecutivePrintGeneration from './MASExecutivePrintGenerationStandalone'
// The runtime draws its blueprint overlay on document.body, outside the shadow root,
// so the overlay styles have to be global.
import '@/lib/generation/generation.css'

/**
 * The Executive Print benefits report, exactly as exported from Framer
 * (MASExecutivePrintGenerationStandalone.tsx): drawn as a dotted blueprint when it
 * scrolls into view, then revealed hi-fi. Designed at 1000px and scaled down to fit. `animate={false}` shows it finished, with no
 * opening animation and no replay button (the story panel does this).
 * In a shadow root so its bundled Tailwind can't reach the page.
 */
export default function ExecutivePrintCard({ animate = true }: { animate?: boolean } = {}) {
  const [run, setRun] = useState(0)

  return (
    <section aria-labelledby="benefits-report" className="@container">
      <div className="flex flex-col gap-6 @xl:flex-row @xl:items-end @xl:justify-between">
        <div className="max-w-[24.5rem] type-caption text-ink">
          <h3 id="benefits-report" className="font-bold">
            Extra: Benefits report for Executives
          </h3>
          <p className="mt-0.5">
            A sales and value-case piece for IBM Maximo, which can be downloaded and prepared in one printable page, it
            shows an executive why expanding Maximo is worth it.
          </p>
        </div>
        {animate && (
        <button
          type="button"
          onClick={() => setRun((n) => n + 1)}
          className="self-start type-caption text-muted uppercase transition-colors hover:text-accent @xl:self-auto"
        >
          (Click to replay)
        </button>
        )}
      </div>

      {/* Remounting on replay plays the generation again (it's already in view). */}
      <ShadowHost key={run} className="mt-[52px] w-full">
        <ExecutivePrintGeneration
          duration={2000}
          animate={animate}
          threshold={0.35}
          playOnce
          replayOnClick={animate}
          maxParts={30}
          delay={0}
          scaleToFit
        />
      </ShadowHost>
    </section>
  )
}
