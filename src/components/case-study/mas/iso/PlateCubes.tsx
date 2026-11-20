import type { CSSProperties } from 'react'
import { PLATE_RISE } from './layers'
import { CUBE, CUBE_QUADS, FINS, FIN_W, FIN_Y, LAT, LAT_OFF, LID_T, PANE, QUAD_H, QUAD_W, type CubeKind } from './reveal'

/**
 * The two cubes that come out of the rationale plate, as CSS 3D. Each is a lid (the quadrant's own outline square, in its colour), four
 * glass walls standing on a near-black cavity, and contents that grow from the cavity floor. The showcase paints them every frame
 * through reveal.ts (`paintPlate`); nothing here animates on its own except the loops in iso.css (the lattice's colour wave, the bars'
 * breathing).
 *
 * Everything is a child of the plate's own wrapper, so it moves with the plate (hover lift, peel, the stack's docking). It must never get
 * an opacity of its own: that would flatten it. The showcase hides it instead when the plate fades.
 *
 * Coordinates are the cube's own: x east, y south, z up from the plate's top face.
 */

const P3D: CSSProperties = { transformStyle: 'preserve-3d' }
const GLASS = 'linear-gradient(180deg, rgba(222,233,255,.36), rgba(160,185,250,.1))'
const SHUT = 0.0001

/** A wall standing on one edge of the footprint. N and S are planes facing south, E and W planes facing east (the construction the stack's slabs use, with the sign flipped to stand up). */
function wall(side: 'S' | 'N' | 'E' | 'W'): CSSProperties {
  const base: CSSProperties = { position: 'absolute', transformOrigin: '0 0', background: GLASS, boxShadow: 'inset 0 0 0 1.2px rgba(255,255,255,.5)', opacity: 0 }
  switch (side) {
    case 'S':
      return { ...base, left: 0, top: CUBE, width: CUBE, height: PLATE_RISE, transform: `rotateX(90deg) scaleY(${SHUT})` }
    case 'N':
      return { ...base, left: 0, top: 0, width: CUBE, height: PLATE_RISE, transform: `rotateX(90deg) scaleY(${SHUT})` }
    case 'E':
      return { ...base, left: CUBE, top: 0, width: PLATE_RISE, height: CUBE, transform: `rotateY(-90deg) scaleX(${SHUT})` }
    case 'W':
      return { ...base, left: 0, top: 0, width: PLATE_RISE, height: CUBE, transform: `rotateY(-90deg) scaleX(${SHUT})` }
  }
}

function Wall({ side }: { side: 'S' | 'N' | 'E' | 'W' }) {
  return <div data-pm="wall" data-side={side} style={wall(side)} />
}

/** One small cube of the lattice: a top and the two sides the view shows, coloured by the wave in iso.css. It grows from its bottom centre. */
function LatticeCube({ i, j, k }: { i: number; j: number; k: number }) {
  const s = LAT.size
  const face: CSSProperties = { position: 'absolute', width: s, height: s, transformOrigin: '0 0' }
  return (
    <div
      data-pm="lc"
      data-i={i}
      data-j={j}
      data-k={k}
      className="iso-lc"
      style={{
        ...P3D,
        position: 'absolute',
        display: 'none',
        left: LAT_OFF + i * LAT.pitch,
        top: LAT_OFF + j * LAT.pitch,
        width: s,
        height: s,
        transformOrigin: `${s / 2}px ${s / 2}px ${-s}px`,
        ['--i' as string]: i,
      }}
    >
      <div className="iso-lc-top" style={{ ...face, left: 0, top: 0 }} />
      <div className="iso-lc-south" style={{ ...face, left: 0, top: s, transform: 'rotateX(-90deg)' }} />
      <div className="iso-lc-east" style={{ ...face, left: s, top: 0, transform: 'rotateY(90deg)' }} />
    </div>
  )
}

function Lattice() {
  const out = []
  for (let k = 0; k < LAT.n; k++) for (let j = 0; j < LAT.n; j++) for (let i = 0; i < LAT.n; i++) out.push(<LatticeCube key={`${i}${j}${k}`} i={i} j={j} k={k} />)
  return <>{out}</>
}

/** The bars' contents: three thin strips and a pane, upright, growing from the floor. Each strip breathes on its own beat once built. */
function Bars() {
  const fin: CSSProperties = { position: 'absolute', transformOrigin: '0 0', transform: `rotateX(90deg) scaleY(${SHUT})`, visibility: 'hidden' }
  return (
    <>
      {FINS.map((f, i) => (
        <div key={i} data-pm="fin" data-i={i} style={{ ...fin, left: f.x * CUBE, top: FIN_Y * CUBE, width: FIN_W * CUBE, height: f.h * PLATE_RISE }}>
          <div className="iso-fin-pulse absolute inset-0" style={{ background: '#f1f7ff', boxShadow: '0 0 10px rgba(205,226,255,.95)', ['--d' as string]: i * 0.22 }} />
        </div>
      ))}
      <div
        data-pm="pane"
        style={{
          ...fin,
          left: PANE.x * CUBE,
          top: PANE.y * CUBE,
          width: PANE.w * CUBE,
          height: PANE.h * PLATE_RISE,
          background: 'linear-gradient(160deg, #c9d6fe, #7fa0f2)',
          boxShadow: '0 0 12px rgba(150,185,255,.8)',
        }}
      />
    </>
  )
}

function Cube({ kind, x, y, colour, south, east }: { kind: CubeKind; x: number; y: number; colour: string; south: string; east: string }) {
  return (
    <div
      data-pm="cube"
      data-kind={kind}
      style={{ ...P3D, position: 'absolute', left: x + (QUAD_W - CUBE) / 2, top: y + (QUAD_H - CUBE) / 2, width: CUBE, height: CUBE }}
    >
      {/* the cavity the lid leaves behind: near-black navy, inset from the footprint */}
      <div
        data-pm="cavity"
        style={{ position: 'absolute', left: CUBE * 0.04, top: CUBE * 0.04, width: CUBE * 0.92, height: CUBE * 0.92, background: '#04102c', opacity: 0, transform: 'translateZ(1.5px)' }}
      />
      {/* back to front: the far walls, the contents, the near walls, then the lid */}
      <Wall side="N" />
      <Wall side="W" />
      {kind === 'lattice' ? <Lattice /> : <Bars />}
      <Wall side="S" />
      <Wall side="E" />
      <div data-pm="lid" style={{ ...P3D, position: 'absolute', left: 0, top: 0, width: CUBE, height: CUBE, transform: 'translateZ(3px)' }}>
        <div style={{ position: 'absolute', inset: 0, background: colour, boxShadow: 'inset 0 0 0 1.5px rgba(10,25,80,.5)' }} />
        {/* the lid's edge grows out of the plate as it lifts, so it never dips below the surface it came from */}
        <div data-pm="lidwall" data-side="S" style={{ position: 'absolute', left: 0, top: CUBE, width: CUBE, height: LID_T, transformOrigin: '0 0', transform: `rotateX(-90deg) scaleY(${SHUT})`, background: south }} />
        <div data-pm="lidwall" data-side="E" style={{ position: 'absolute', left: CUBE, top: 0, width: LID_T, height: CUBE, transformOrigin: '0 0', transform: `rotateY(90deg) scaleX(${SHUT})`, background: east }} />
      </div>
    </div>
  )
}

export default function PlateCubes() {
  return (
    <div data-pm="root" aria-hidden className="pointer-events-none absolute inset-0" style={P3D}>
      {CUBE_QUADS.map((q) => (
        <Cube key={q.id} kind={q.cube} x={q.x} y={q.y} colour={q.colour} south={q.south} east={q.east} />
      ))}
    </div>
  )
}
