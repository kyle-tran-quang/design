import { forwardRef } from 'react'
import { LAYERS, W } from './layers'
import PlateTop from './PlateTop'
import PlateCubes from './PlateCubes'
import PlateBook from './PlateBook'
import Sheet from './Sheet'
import './iso.css'

/** The spreadsheets' accent: Excel's own green, which the old workbook was. */
const SHEET_ACCENT = '#107c41'

/**
 * The layers under the Sales Configurator, as CSS 3D boxes: a top face and the two walls the dimetric view shows.
 * Plates are siblings under the shared 3D world, not nested, so each can carry its own opacity (for hover and focus)
 * without flattening the scene. Translucent plates are appended back to front.
 *
 * The showcase positions every box each frame through `data-layer`; nothing here animates on its own.
 */
type StackProps = { onRef?: (id: string, el: HTMLElement | null) => void }


const Stack = forwardRef<HTMLDivElement, StackProps>(function Stack({ onRef }, ref) {
  // Deepest first: translucent plates need explicit back-to-front DOM order in CSS 3D.
  const ordered = [...LAYERS].sort((a, b) => b.depth - a.depth)
  return (
    <div ref={ref} className="absolute" style={{ left: 0, top: 0, width: 0, height: 0, transformStyle: 'preserve-3d' }}>
      {ordered.map((l) => {
        const t = l.thick * W
        return (
          <div
            key={l.id}
            ref={(el) => onRef?.(l.id, el)}
            data-layer={l.id}
            className="absolute"
            style={{ left: l.x - l.w / 2, top: l.y - l.h / 2, width: l.w, height: l.h, transformStyle: 'preserve-3d' }}
          >
            <div data-face="top" className="absolute inset-0" style={{ background: l.top }}>
              {l.platform && <PlateTop />}
              {l.glass && !l.platform && (
                <div
                  className="absolute inset-0"
                  style={{ border: '6px solid #2f7bff', boxShadow: 'inset 0 0 26px rgba(70,140,255,.95)' }}
                />
              )}
              {l.id === 'workflow' && (
                <div
                  className="absolute"
                  style={{
                    inset: 30,
                    border: '1.5px solid rgba(170,60,80,.55)',
                    background:
                      'linear-gradient(to bottom right, transparent calc(50% - .8px), rgba(170,60,80,.6) 50%, transparent calc(50% + .8px)), linear-gradient(to top right, transparent calc(50% - .8px), rgba(120,120,135,.55) 50%, transparent calc(50% + .8px))',
                  }}
                />
              )}
              {l.w < W && <div className="absolute" style={{ inset: '20%', border: '1.5px solid rgba(255,255,255,.28)' }} />}
              {l.sheet && <Sheet kind={l.sheet} w={l.w} h={l.h} index={['pricing', 'costing', 'provisioning'].indexOf(l.sheet)} accent={SHEET_ACCENT} />}
            </div>
            {/* South wall hangs from the bottom edge; east wall from the right edge. */}
            <div
              data-face="south"
              className="absolute"
              style={{ left: 0, top: l.h, width: l.w, height: t, transformOrigin: '0 0', transform: 'rotateX(-90deg)', background: l.south }}
            />
            <div
              data-face="east"
              className="absolute"
              style={{ left: l.w, top: 0, width: t, height: l.h, transformOrigin: '0 0', transform: 'rotateY(90deg)', background: l.east }}
            />
            {l.platform && <PlateCubes />}
            {l.book && <PlateBook />}
          </div>
        )
      })}
    </div>
  )
})

export default Stack
