import { useSyncExternalStore } from 'react'
import { TOPIC_IDS } from './layers'

/**
 * Interaction state for the showcase: which topic is hovered and which is open. It lives outside React's render path
 * because hover changes on every pointer move and the showcase paints straight to the DOM; only the panel, the hint and
 * the keyboard list subscribe to it. Everything here is a topic id (see layers.ts), not a single plate.
 */
export type Interaction = {
  /** The topic under the pointer or keyboard focus, or null. */
  hover: string | null
  /** The open topic (its story is showing and the camera has pulled in), or null. */
  focus: string | null
  /** Whether the scene has reached the frame where topics can be used. Hit-testing is off while it scrubs. */
  ready: boolean
  /** The reader has opened a topic at least once: they know the layers are clickable, so the hint and the wave stand down. */
  engaged: boolean
}

let state: Interaction = { hover: null, focus: null, ready: false, engaged: false }
const listeners = new Set<() => void>()

function set(next: Partial<Interaction>) {
  const merged = { ...state, ...next }
  if (merged.hover === state.hover && merged.focus === state.focus && merged.ready === state.ready && merged.engaged === state.engaged) return
  state = merged
  listeners.forEach((l) => l())
}

export const interaction = {
  get: () => state,
  hover: (id: string | null) => set({ hover: id }),
  open: (id: string) => {
    if (state.ready) set({ focus: id, hover: id, engaged: true })
  },
  /**
   * Closes the open topic. `hover` goes with it: `open` sets it to the opened topic, and nothing but a pointer move would clear it, so
   * closing from the keyboard (Esc) left that topic "hovered" with nobody pointing at it: lifted, its tooltip up, and every layer in
   * front of it ghosted to 10 %. The showcase puts it back if the pointer really is still over a layer (see its `rehover`).
   */
  close: () => set({ focus: null, hover: null }),
  /** Opens the topic `by` places along the reading order from the open one, wrapping at the ends. */
  step: (by: number) => {
    if (!state.ready || !state.focus) return
    const i = TOPIC_IDS.indexOf(state.focus)
    set({ focus: TOPIC_IDS[(i + by + TOPIC_IDS.length) % TOPIC_IDS.length], engaged: true })
  },
  ready: (ready: boolean) => set(ready ? { ready } : { ready, hover: null, focus: null }),
  subscribe(l: () => void) {
    listeners.add(l)
    return () => listeners.delete(l)
  },
}

export function useInteraction() {
  return useSyncExternalStore(interaction.subscribe, interaction.get, interaction.get)
}
