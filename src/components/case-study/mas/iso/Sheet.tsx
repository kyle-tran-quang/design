import type { CSSProperties } from 'react'

/**
 * A wireframe spreadsheet that fills a tile's top face when the Excel layer opens: the shape of a worksheet (a formula bar, column and
 * row headers, hairline grid, a selected cell, sheet tabs), with no text in it at all. Every label is an empty box; every value is a grey
 * bar, so it reads as a sketch of the old workbook, not a screenshot of it.
 *
 * It is one flat layer. Its whole entrance is a single custom property, `--p` (0..1), which the showcase sets per frame through
 * reveal.ts; every piece reads it through its own delay `--d` (see iso.css), so a frame costs one style write for the whole sheet.
 */

export type SheetKind = 'pricing' | 'costing' | 'provisioning'

type Spec = {
  cols: number
  /** Which columns hold numbers (their bars sit against the right edge of the cell). */
  nums: number[]
  tabs: number
  /** The three cells the selection hops between: [col, row]. */
  sel: [number, number][]
  /** Seed for the bars' lengths, so the three sheets do not look cut from one another. */
  seed: number
}

const SPECS: Record<SheetKind, Spec> = {
  pricing: { cols: 3, nums: [1, 2], tabs: 3, sel: [[2, 5], [1, 8], [2, 11]], seed: 3 },
  costing: { cols: 5, nums: [1, 2, 3, 4], tabs: 3, sel: [[4, 10], [3, 4], [4, 12]], seed: 7 },
  provisioning: { cols: 2, nums: [1], tabs: 1, sel: [[1, 3], [0, 7], [1, 10]], seed: 11 },
}

/** Fixed bands, in world px. The grid takes what is left. */
const GUTTER = 66
const BAR = 92
const HEAD = 64
const TAB = 76
const ROWS = 16

/** A deterministic pseudo-random 0..1, so a sheet is the same every time it opens. */
const rnd = (n: number) => {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453
  return x - Math.floor(x)
}

const INK = '#c9c9ce'
const LINE = '#d6d6da'

type SheetProps = { kind: SheetKind; w: number; h: number; index: number; accent: string }

const d = (v: number): CSSProperties => ({ ['--d' as string]: v.toFixed(3) })

export default function Sheet({ kind, w, h, index, accent }: SheetProps) {
  const s = SPECS[kind]
  const colW = (w - GUTTER) / s.cols
  const rowH = (h - BAR - HEAD - TAB) / ROWS
  const gx = (c: number) => GUTTER + c * colW
  const gy = (r: number) => BAR + HEAD + r * rowH
  /** When a row fills in: top to bottom across the middle of the sheet's time. */
  const rowD = (r: number) => 0.16 + (r / ROWS) * 0.5
  const sel = s.sel.map(([c, r]) => ({ x: gx(c), y: gy(r), w: colW }))
  const box = { borderColor: LINE, background: '#fff' }

  return (
    <div
      data-sheet={kind}
      data-i={index}
      aria-hidden
      className="iso-sheet pointer-events-none absolute inset-0 overflow-hidden"
      style={{ visibility: 'hidden', background: '#fafafb', ['--p' as string]: 0 }}
    >
      {/* formula bar: an empty name box and an empty formula field, with a caret waiting in it */}
      <div className="absolute inset-x-0 top-0 flex items-center gap-4 border-b px-4" style={{ height: BAR, borderColor: LINE, background: '#f1f1f3' }}>
        <div data-d style={{ ...d(0.04), ...box, width: 128 }} className="h-12 shrink-0 border" />
        <div data-d style={{ ...d(0.1), ...box }} className="flex h-12 min-w-0 flex-1 items-center border px-4">
          <span className="iso-sheet-caret inline-block h-7 w-[3px]" style={{ background: '#161616' }} />
        </div>
      </div>

      {/* column headers: empty cells */}
      <div className="absolute inset-x-0" style={{ top: BAR, height: HEAD, background: '#ececef', borderBottom: `1px solid ${LINE}` }}>
        {Array.from({ length: s.cols }, (_, c) => (
          <div
            key={c}
            data-d
            style={{ ...d(0.1 + c * 0.03), left: gx(c), width: colW, height: HEAD, borderLeft: `1px solid ${LINE}` }}
            className="absolute top-0"
          />
        ))}
      </div>

      {/* row headers: an empty column, its cells divided by the row lines below */}
      <div data-d style={{ ...d(0.1), top: BAR + HEAD, left: 0, width: GUTTER, bottom: TAB, background: '#ececef', borderRight: `1px solid ${LINE}` }} className="absolute" />

      {/* hairlines: a row's line draws left to right as the row fills in; the columns' fade in with the headers */}
      {Array.from({ length: ROWS + 1 }, (_, r) => (
        <div key={`h${r}`} data-bar style={{ ...d(rowD(Math.min(r, ROWS - 1)) - 0.03), left: 0, right: 0, top: gy(r), height: 1, background: LINE }} className="absolute" />
      ))}
      {Array.from({ length: s.cols - 1 }, (_, c) => (
        <div key={`v${c}`} data-d style={{ ...d(0.14), left: gx(c + 1), top: BAR + HEAD, bottom: TAB, width: 1, background: LINE }} className="absolute" />
      ))}

      {/* the cells: a grey bar a row, per column, in place of text. The first row is the table's header, the second to last is its total. */}
      {Array.from({ length: ROWS }, (_, r) =>
        Array.from({ length: s.cols }, (_, c) => {
          const head = r === 0
          const total = r === ROWS - 2
          const num = s.nums.includes(c)
          const frac = head ? 0.5 : total ? 0.62 : 0.3 + 0.55 * rnd(r * 31 + c * 17 + s.seed)
          const barW = Math.max(14, (colW - 28) * (num ? Math.min(frac, 0.78) : frac))
          return (
            <div
              key={`${r}-${c}`}
              data-bar={num ? 'r' : 'l'}
              style={{
                ...d(rowD(r) + c * 0.025),
                top: gy(r) + (rowH - (head || total ? 18 : 13)) / 2,
                height: head || total ? 18 : 13,
                width: barW,
                ...(num ? { right: w - gx(c + 1) + 14 } : { left: gx(c) + 14 }),
                background: head ? '#8d8d93' : total ? accent : INK,
                borderRadius: 2,
              }}
              className="absolute"
            />
          )
        }),
      )}
      {/* the total's rule */}
      <div data-bar style={{ ...d(rowD(ROWS - 2) - 0.02), left: GUTTER, right: 0, top: gy(ROWS - 2), height: 3, background: accent }} className="absolute" />

      {/* the selected cell: it hops between three cells once the sheet is full */}
      <div
        className="iso-sheet-sel absolute"
        style={{
          height: rowH,
          boxShadow: `inset 0 0 0 3.5px ${accent}`,
          background: 'rgba(16,124,65,.08)',
          ['--x0' as string]: `${sel[0].x}px`,
          ['--y0' as string]: `${sel[0].y}px`,
          ['--w0' as string]: `${sel[0].w}px`,
          ['--x1' as string]: `${sel[1].x}px`,
          ['--y1' as string]: `${sel[1].y}px`,
          ['--w1' as string]: `${sel[1].w}px`,
          ['--x2' as string]: `${sel[2].x}px`,
          ['--y2' as string]: `${sel[2].y}px`,
          ['--w2' as string]: `${sel[2].w}px`,
        }}
      >
        <span className="absolute -right-[5px] -bottom-[5px] size-[12px]" style={{ background: accent, outline: '2px solid #fafafb' }} />
      </div>

      {/* sheet tabs: empty boxes, the first one the open sheet */}
      <div className="absolute inset-x-0 bottom-0 flex items-end gap-1.5 border-t px-4" style={{ height: TAB, background: '#ececef', borderColor: LINE }}>
        {Array.from({ length: s.tabs }, (_, i) => (
          <div
            key={i}
            data-d
            style={{
              ...d(0.7 + i * 0.05),
              width: i === 0 ? 150 : 124,
              background: i === 0 ? '#fafafb' : 'transparent',
              borderTop: i === 0 ? `3px solid ${accent}` : '3px solid transparent',
              borderLeft: `1px solid ${i === 0 ? LINE : '#dcdce0'}`,
              borderRight: `1px solid ${i === 0 ? LINE : '#dcdce0'}`,
            }}
            className="h-[52px] shrink-0"
          />
        ))}
      </div>

      {/* the sheet's own outline */}
      <div className="absolute inset-0" style={{ boxShadow: `inset 0 0 0 1px ${LINE}` }} />
    </div>
  )
}
