import type { CSSProperties, ReactNode } from 'react'
import { BOOK, BOOK_T } from './reveal'

/**
 * A book that rises out of the bottom plate when its story (feedback and lessons learned) opens: it grows up out of the pink surface
 * closed, the cover swings open, and its pages then flip, one after another and back, in a loop.
 *
 * It is built like a real one, and kept plain:
 *  - two halves, each a cover board under a block of pages, the same thickness;
 *  - the left half (board and pages together) is hinged to the right at the spine, so the cover is always under its own pages and the
 *    book closes by folding that half over the right one;
 *  - three loose leaves lie on the two blocks and hinge on the spine at the height of the blocks' tops, so they always touch it.
 *
 * reveal.ts (`paintBook`) places the book while it opens: one scale (the book grows up out of the plate), one angle (the left half) and
 * one slide (the closed book is centred on the plate). Once it is open the flipping is `iso-flip-*` in iso.css, with no JS.
 *
 * Coordinates are the plate's own: x east, y south, z up from its top face. As in PlateCubes, none of it may take an opacity of its own,
 * which would flatten the 3D; the showcase hides the whole book when the plate fades.
 */

const P3D: CSSProperties = { transformStyle: 'preserve-3d' }
const { pw, ph, board, pages, over, leaves, eps, cx, cy } = BOOK

/** The cover is the plate's own pink: the top of its south wall (layers.ts, `foundation`) outside, its east wall inside. */
const COVER = '#aa4a60'
const COVER_INSIDE = '#8a3548'
const COVER_S = '#9a3f55'
const COVER_E = '#7a2e40'
const PAPER = '#f4f1ea'
/** A block's walls show its pages as fine lines, running along the book's thickness. */
const edge = (dir: 'to bottom' | 'to right', base: string) => `repeating-linear-gradient(${dir}, rgba(0,0,0,.09) 0 1px, transparent 1px 4px), ${base}`
const PAPER_S = edge('to bottom', '#e2ddd1')
const PAPER_E = edge('to right', '#cdc7b8')

/** Where the leaves hinge: one axis for all of them, just above the blocks. Each leaf's face is then offset from it (see Leaf). */
export const LEAF_AXIS = BOOK_T + ((leaves + 1) / 2) * eps

const abs = (css: CSSProperties): CSSProperties => ({ position: 'absolute', ...css })

type SlabProps = {
  x: number
  y: number
  w: number
  h: number
  /** Height of its underside, and its thickness. */
  z: number
  t: number
  top: string
  south: string
  /** The side wall the view can see once the slab is folded over: east for the right half, west for the left. */
  side: 'E' | 'W'
  sideColour: string
  /** The underside, if it can show (a cover board's outside, once the half is folded over). */
  bottom?: string
  children?: ReactNode
}

/** A box: a top, a south wall, one side wall and, if asked for, an underside. Walls hang down from the top's edges (the same construction as the stack's slabs). */
function Slab({ x, y, w, h, z, t, top, south, side, sideColour, bottom, children }: SlabProps) {
  return (
    <div style={{ ...abs({ left: x, top: y, width: w, height: h }), ...P3D, transform: `translateZ(${z + t}px)` }}>
      <div style={abs({ inset: 0, background: top, backfaceVisibility: 'hidden' })}>{children}</div>
      <div style={abs({ left: 0, top: h, width: w, height: t, transformOrigin: '0 0', transform: 'rotateX(-90deg)', background: south })} />
      <div style={abs({ left: side === 'E' ? w : 0, top: 0, width: t, height: h, transformOrigin: '0 0', transform: 'rotateY(90deg)', background: sideColour })} />
      {bottom && <div style={abs({ inset: 0, background: bottom, transform: `translateZ(${-t}px) rotateX(180deg)`, backfaceVisibility: 'hidden' })} />}
    </div>
  )
}

/** A few grey bars, so a page reads as a page. They are the book's only detail. `spine` is the side the margin is wider on. */
function Lines() {
  return (
    <div className="absolute" style={{ inset: '16% 14% 16% 20%' }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="absolute" style={{ left: 0, top: `${i * 21}%`, height: 7, width: `${i === 4 ? 52 : 100 - (i % 2) * 12}%`, background: 'rgba(60,64,80,.16)', borderRadius: 2 }} />
      ))}
    </div>
  )
}

/**
 * One leaf: two faces back to back, hinged on the spine, lying on the right at rest. It rotates about the one axis every leaf shares, and
 * its face is offset along z from that axis so that, lying on the right, the first leaf to flip is on top and, lying on the left, it is
 * underneath the ones that land after it (each leaf's offset is the mirror of its height on the other side).
 */
function Leaf({ n }: { n: number }) {
  const dz = ((leaves - 1) / 2 - n) * eps
  const face: CSSProperties = abs({ left: 0, top: 0, width: pw, height: ph, backfaceVisibility: 'hidden', background: PAPER })
  return (
    <div
      data-pm="leaf"
      data-n={n}
      className={`iso-leaf iso-leaf-${n}`}
      style={{ ...abs({ left: cx, top: cy - ph / 2, width: pw, height: ph, transformOrigin: '0 50% 0' }), ...P3D, ['--h0' as string]: `${LEAF_AXIS}px`, transform: `translateZ(${LEAF_AXIS}px) rotateY(0deg)` }}
    >
      <div style={{ ...abs({ inset: 0 }), ...P3D, transform: `translateZ(${dz}px)` }}>
        <div style={{ ...face, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.07), inset 9px 0 12px -9px rgba(0,0,0,.2)' }}>
          <Lines />
        </div>
        <div style={{ ...face, transform: 'rotateY(180deg)', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.07), inset -9px 0 12px -9px rgba(0,0,0,.2)' }}>
          <Lines />
        </div>
      </div>
    </div>
  )
}

export default function PlateBook() {
  const boardW = pw + over
  const boardH = ph + 2 * over
  return (
    <div data-pm="book" aria-hidden className="pointer-events-none absolute inset-0" style={{ ...P3D, visibility: 'hidden' }}>
      {/* the closed book is centred on the plate; it slides to put its spine there as it opens */}
      <div data-pm="slide" style={{ ...abs({ left: 0, top: 0, width: 0, height: 0 }), ...P3D, transform: `translateX(${-boardW / 2}px)` }}>
        {/* its shadow on the plate: as wide as the open book, scaled to the closed one while it is shut */}
        <div
          data-pm="shade"
          style={abs({ left: cx - boardW, top: cy - boardH / 2, width: 2 * boardW, height: boardH, background: 'rgba(52,14,28,.3)', boxShadow: '0 0 34px 14px rgba(52,14,28,.18)', borderRadius: 4, opacity: 0, transform: 'translateZ(1.5px) scaleX(.5)' })}
        />

        {/* everything that stands up grows from the plate's surface: one scale in z, about it */}
        <div data-pm="rise" style={{ ...abs({ left: 0, top: 0, width: 0, height: 0 }), ...P3D, visibility: 'hidden', transformOrigin: '0 0 0', transform: 'scale3d(1,1,.0001)' }}>
          {/* the right half: a board, and a block of pages on it */}
          <Slab x={cx} y={cy - boardH / 2} w={boardW} h={boardH} z={0} t={board} top={COVER_INSIDE} south={COVER_S} side="E" sideColour={COVER_E} bottom={COVER} />
          <Slab x={cx} y={cy - ph / 2} w={pw} h={ph} z={board} t={pages} top={PAPER} south={PAPER_S} side="E" sideColour={PAPER_E}>
            <Lines />
          </Slab>

          {/* the leaves, on the two blocks: they only exist once the cover is open (shut, they are inside the book) */}
          <div data-pm="leaves" style={{ ...abs({ left: 0, top: 0, width: 0, height: 0 }), ...P3D, visibility: 'hidden' }}>
            {Array.from({ length: leaves }, (_, n) => (
              <Leaf key={n} n={n} />
            ))}
          </div>

          {/* the left half, hinged at the spine at the height of the blocks' tops. At 180 degrees it lies folded over the right half, cover up. */}
          <div
            data-pm="half"
            style={{ ...abs({ left: cx - boardW, top: cy - boardH / 2, width: boardW, height: boardH }), ...P3D, transformOrigin: `${boardW}px 50% ${BOOK_T}px`, transform: 'rotateY(180deg)' }}
          >
            <Slab x={0} y={0} w={boardW} h={boardH} z={0} t={board} top={COVER_INSIDE} south={COVER_S} side="W" sideColour={COVER_E} bottom={COVER} />
            <Slab x={over} y={over} w={pw} h={ph} z={board} t={pages} top={PAPER} south={PAPER_S} side="W" sideColour={PAPER_E}>
              <Lines />
            </Slab>
          </div>
        </div>
      </div>
    </div>
  )
}
