import { useInteraction } from './interaction'

/**
 * The showcase's one-paragraph pitch, in the empty bottom-right of the finished pose: what this stack is and that each layer opens.
 * It keeps the same rule as the hint at the foot of the viewport: it arrives as the build finishes and the layers become usable, and
 * it goes while a story is open (the panel and the camera need that side of the frame), returning when the story closes.
 *
 * It sits the same distance from the right and bottom edges (16 px, 20 px from 1024 px up: the inset of the logo at the top-left), so the
 * corner reads as even. It takes no pointer events, so it can never cover a layer the reader wants to click, and it is `inert` while
 * hidden so assistive tech skips it.
 */
export default function IntroCard() {
  const { ready, focus } = useInteraction()
  const show = ready && !focus
  return (
    <div
      inert={!show}
      className={`pointer-events-none absolute right-4 bottom-4 left-4 z-[5] transition-[opacity,translate] duration-500 ease-out motion-reduce:transition-none min-[810px]:left-auto min-[810px]:w-[26rem] lg:right-5 lg:bottom-5 ${
        show ? 'translate-y-0 opacity-100 delay-300' : 'translate-y-2 opacity-0'
      }`}
    >
      <div className="rounded-[16px] border border-black/10 bg-white/85 p-4 shadow-[0_18px_40px_-20px_rgba(10,14,24,.35)] backdrop-blur-md min-[810px]:rounded-[20px] min-[810px]:p-6">
        <h3 className="type-topic !text-[1.0625rem] !leading-[1.25] min-[810px]:!text-[1.5rem] min-[810px]:!leading-[1.2]">
          Explore a connected system for faster Maximo quotes
        </h3>
        <p className="mt-2 text-[0.875rem] leading-[1.45] tracking-[-0.005em] text-body min-[810px]:mt-3 min-[810px]:type-small">
          I replaced a chain of Excel files, CPQ, Slack and email with one estimator, an AI assistant and a public pricing page. Each layer
          is a story you can open.
        </p>
      </div>
    </div>
  )
}
