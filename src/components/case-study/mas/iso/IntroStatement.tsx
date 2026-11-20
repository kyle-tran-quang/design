import { forwardRef } from 'react'

/**
 * The problem statement the showcase opens on: what was wrong before any of the system exists. It sits on the face's empty grey plate
 * while the scene is held on its first frame, then fades as the UI starts to rise (see INTRO_VH in scene.ts).
 *
 * The overlay is placed and faded by the showcase, which knows where the plate is on screen and how far the reader has scrolled.
 * Readers who get the still showcase (reduced motion, low power) never see the plate empty, so they get `StatementBlock` instead,
 * the same words as an ordinary section above it.
 */
const Words = () => (
  <>
    <p className="mb-4 font-sans text-[1rem] leading-none font-medium tracking-[-0.005em] text-dim min-[640px]:text-[1.125rem]">The problem</p>
    <p className="text-[1.375rem] leading-[1.3] font-normal tracking-[-0.02em] text-ink min-[640px]:text-[1.625rem] min-[1100px]:text-[1.75rem]">
      Maximo's AppPoints pricing confuses buyers before they reach a seller, then leaves sellers juggling between five tools in their manual
      workflow.
    </p>
    <p className="mt-6 text-[1.375rem] leading-[1.3] font-normal tracking-[-0.02em] text-dim min-[640px]:text-[1.625rem] min-[1100px]:text-[1.75rem]">
      This wastes <span className="text-ink">1,000+ hours</span> on quoting, and sales cycles are extended from{' '}
      <span className="text-ink">9 months to 2 years</span>.
    </p>
  </>
)

/**
 * Over the plate: the showcase sizes, places and fades it. The root is the plate (or, at narrow widths, a card that shrinks onto it); the
 * text block inside is centred in it at a fixed width, so it does not reflow while the card shrinks.
 */
const IntroStatement = forwardRef<HTMLDivElement>(function IntroStatement(_, ref) {
  return (
    <div ref={ref} className="pointer-events-none absolute z-[2] overflow-hidden" style={{ left: 0, top: 0, width: '100%', height: '100%' }}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-[clamp(1.25rem,6.2%,3.5rem)] will-change-[opacity,transform]">
        <Words />
      </div>
    </div>
  )
})

export default IntroStatement

/** The same statement as a plain section, for the still showcase. */
export function StatementBlock() {
  return (
    <div className="bg-[#e4e5e8] px-6 py-24 min-[810px]:py-32">
      <div className="mx-auto max-w-[680px]">
        <Words />
      </div>
    </div>
  )
}
