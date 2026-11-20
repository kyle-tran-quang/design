import { useLayoutEffect, useRef, useState } from 'react'
import { asset } from '@/lib/asset'
import { Collapse, Stage, Stream, type Act } from './kit'
import { CIcon } from './icons'
import { SCENARIOS, type Card, type Msg, type Scenario } from './scenarios'
import './chat.css'

/**
 * The AI chat story's scenarios: IBM Carbon's chat widget (rebuilt from the Figma export in public/assets/images/mas-iso/module-ai-chat.svg)
 * playing four made-up conversations, built with the Stageshow kit (a pared-down copy lives in ./kit).
 *
 * Each scenario plays once when it is first in view; the tabs switch scenarios and Replay plays the open one again. Under reduced motion
 * the stage shows the scenario's still frame instead.
 */

type S = {
  /** How many messages are in the thread. */
  n: number
  /** What is typed in the composer. */
  draft: string
  /** The reply is on its way: three dots. */
  thinking: boolean
  /** The message being written, and how many of its words show. */
  live: number
  words: number
  /** The card, button and feedback icons under the newest reply. */
  detail: boolean
  /** The thread was cleared and the greeting is back (the last scenario). */
  cleared: boolean
}

const AVATAR = asset('assets/images/mas-iso/watsonx-avatar.png')
const wordCount = (t: string) => t.split(' ').length

const initialOf = (sc: Scenario): S => ({ n: sc.start, draft: '', thinking: false, live: -1, words: 0, detail: true, cleared: false })
const posterOf = (sc: Scenario): S => ({ ...initialOf(sc), n: sc.still })

/** Types each seller line into the composer, lets watsonx think, then writes its reply word by word. */
const scriptOf = (sc: Scenario) =>
  async function script(a: Act<S>) {
    await a.wait(900)
    for (let i = sc.start; i < sc.msgs.length; i++) {
      if (i === sc.resetAt) break
      const m = sc.msgs[i]
      if (m.from === 'you') {
        await a.type('draft', m.text, { interval: 26 })
        await a.wait(380)
        a.put({ draft: '', n: i + 1 })
        await a.wait(520)
      } else {
        a.put({ thinking: true })
        await a.wait(1000)
        a.put({ thinking: false, n: i + 1, live: i, words: 0, detail: false })
        await a.wait(160)
        for (let w = 1; w <= wordCount(m.text); w++) {
          a.put({ words: w })
          await a.wait(34)
        }
        await a.wait(260)
        a.put({ live: -1, detail: true })
        await a.wait(m.card || m.action ? 1700 : 650)
      }
    }
    if (sc.resetAt !== undefined) {
      await a.wait(900)
      await a.click('restart')
      await a.wait(250)
      a.put({ cleared: true })
      await a.wait(2600)
    } else {
      await a.wait(2600)
    }
  }

function QuoteCard({ card }: { card: Card }) {
  return (
    <div className="cc-card">
      <div className="cc-card-title">{card.title}</div>
      {card.rows.map(([k, v]) => (
        <div key={k} className="cc-row">
          <span>{k}</span>
          <span>{v}</span>
        </div>
      ))}
      <div className="cc-total">
        <span>{card.total[0]}</span>
        <strong>{card.total[1]}</strong>
      </div>
    </div>
  )
}

function Feedback() {
  return (
    <div className="cc-fb">
      <CIcon name="thumbsUp" />
      <CIcon name="thumbsDown" />
      <CIcon name="copy" />
      <CIcon name="renew" />
    </div>
  )
}

function Message({ m, count, detail }: { m: Msg; count: number; detail: boolean }) {
  if (m.from === 'you') {
    return (
      <div className="cc-msg cc-msg--you">
        <div className="cc-who">You {m.time}</div>
        <div className="cc-bubble">{m.text}</div>
      </div>
    )
  }
  return (
    <div className="cc-msg cc-msg--bot">
      <img className="cc-avatar" src={AVATAR} alt="" width={28} height={28} />
      <div className="cc-who">watsonx {m.time}</div>
      <div className="cc-body">
        <p className="cc-text">
          <Stream text={m.text} count={count} />
        </p>
        {m.card && (
          <Collapse open={detail} reveal="drop">
            <QuoteCard card={m.card} />
          </Collapse>
        )}
        {m.action && (
          <Collapse open={detail} reveal="drop">
            {/* A drawn button, not a real one: the cursor points at it by name */}
            <div className="cc-btn" data-target="restart" data-cursor="pointer">
              {m.action}
              <CIcon name="renew" />
            </div>
          </Collapse>
        )}
        {(m.card || m.action) && (
          <Collapse open={detail}>
            <Feedback />
          </Collapse>
        )}
      </div>
    </div>
  )
}

function Widget({ sc, s }: { sc: Scenario; s: S }) {
  const live = s.live
  const thread = useRef<HTMLDivElement>(null)
  const flow = useRef<HTMLDivElement>(null)
  // The thread fills from the top, as Carbon's does, and only once it is taller than its box does it hold the newest message and let
  // the oldest go up under a soft edge. The edge shows only then, so a short thread never has its first message faded.
  const [over, setOver] = useState(false)
  useLayoutEffect(() => {
    const t = thread.current
    const f = flow.current
    if (!t || !f) return
    const pad = parseFloat(getComputedStyle(t).paddingBottom) || 0
    // The flow fills the box's content area when the thread is short, so it is only taller than that once it overflows.
    const measure = () => setOver(f.offsetHeight > t.clientHeight - pad + 1)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(f)
    ro.observe(t)
    return () => ro.disconnect()
  }, [])

  return (
    <div className="cc-widget">
      <div className="cc-head">
        <span className="cc-ai">AI</span>
        <CIcon name="overlay" />
        <CIcon name="subtract" />
      </div>

      <div ref={thread} className="cc-thread" data-over={over || undefined}>
        <div ref={flow} className="cc-flow">
        {sc.msgs.map((m, i) => {
          // After the thread is cleared only the greeting that comes back stays; before it, messages show up to `n`.
          const open = s.cleared ? i === sc.resetAt : i < s.n && i !== sc.resetAt
          const count = i === live ? s.words : wordCount(m.text)
          const detail = i < s.n - 1 || s.detail
          return (
            <Collapse key={i} open={open} reveal="drop" from="below">
              <Message m={m} count={count} detail={detail} />
            </Collapse>
          )
        })}
        <Collapse open={s.thinking} reveal="drop" from="below">
          <div className="cc-msg cc-msg--bot">
            <img className="cc-avatar" src={AVATAR} alt="" width={28} height={28} />
            <div className="cc-who">watsonx</div>
            <div className="cc-body cc-dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
          </div>
        </Collapse>
        </div>
      </div>

      <div className="cc-composer">
        <span className="cc-input">
          {s.draft ? (
            <span className="cc-typed">
              {s.draft}
              <span className="cc-caret" />
            </span>
          ) : (
            <span className="cc-ph">Type something...</span>
          )}
        </span>
        <CIcon name="microphone" />
        <span className="cc-send" data-ready={s.draft ? '' : undefined}>
          <CIcon name="sendAlt" />
        </span>
      </div>
    </div>
  )
}

// The page's own greys, so the stage sits with the other images in the panel; Carbon's blue and IBM Plex Sans inside it.
const TOKENS = {
  '--ss-font': "'IBM Plex Sans', system-ui, -apple-system, sans-serif",
  '--ss-well': '#f2f4f8',
  '--ss-accent': '#0f62fe',
} as const

function Play({ sc }: { sc: Scenario }) {
  return (
    <Stage<S>
      width={440}
      height={600}
      compact={{ below: 400, width: 342, height: 600 }}
      fill
      initial={initialOf(sc)}
      poster={posterOf(sc)}
      script={scriptOf(sc)}
      play="once"
      tokens={TOKENS}
      cursor={sc.resetAt !== undefined ? { at: { wide: { x: 396, y: 520 }, compact: { x: 320, y: 520 } }, ripple: true } : undefined}
      className="cc"
    >
      {(s) => <Widget sc={sc} s={s} />}
    </Stage>
  )
}

export default function ChatScenarios() {
  const [id, setId] = useState(SCENARIOS[0].id)
  // Bumped to play the open scenario again: a keyed remount, which is how the kit restarts a story.
  const [run, setRun] = useState(0)
  const sc = SCENARIOS.find((x) => x.id === id) ?? SCENARIOS[0]

  return (
    <figure className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div role="group" aria-label="Example conversation" className="flex flex-wrap gap-2">
          {SCENARIOS.map((x) => {
            const on = x.id === sc.id
            return (
              <button
                key={x.id}
                type="button"
                aria-pressed={on}
                onClick={() => {
                  setId(x.id)
                  setRun((r) => r + 1)
                }}
                className={`rounded-full border px-3.5 py-2 text-[0.8125rem] leading-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  on ? 'border-ink bg-ink text-white' : 'border-line bg-white text-body hover:bg-cloud'
                }`}
              >
                {x.label}
              </button>
            )
          })}
        </div>
        <button
          type="button"
          onClick={() => setRun((r) => r + 1)}
          className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[0.8125rem] leading-none text-dim transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <CIcon name="renew" size={14} />
          Replay
        </button>
      </div>

      {/* The conversation is a picture: one description for screen readers instead of the drawn chat. */}
      <div role="img" aria-label={sc.summary} className="overflow-hidden rounded-lg">
        <Play key={`${sc.id}-${run}`} sc={sc} />
      </div>

      <figcaption className="type-small text-dim" aria-live="polite">
        {sc.summary}
      </figcaption>
    </figure>
  )
}
