import { MODULES, MODULE_RADIUS, W } from './layers'
import { asset } from '@/lib/asset'

/**
 * The two floor modules and their connectors, as CSS 3D slabs. Like the stack, they are siblings under the shared 3D
 * world, positioned each frame by the showcase through `data-module` and `data-connector`.
 *
 * Each connector is one flat bar on the floor, at the height of the module's top face, so both its ends sit at one level
 * and it is parallel to the floor and to every plate. (They used to be one slanted rod between the stack's wall and the
 * module, which was parallel to nothing.)
 */
type ModulesProps = {
  onRef?: (id: string, el: HTMLElement | null) => void
  /** `key` is `<module>:<colour>`. */
  onConnector?: (key: string, el: HTMLElement | null) => void
}

/** The two lines, as in the clip: one dark blue, one grey, a little apart. */
const LINES = [['#1b3fa0', -42], ['#8791a6', 42]] as const

const SOUTH = [0xcf, 0xd6, 0xe4]
const EAST = [0x8c, 0x97, 0xad]
/** Wall colour round a corner: the south wall's at 90 degrees (facing south), the east wall's at 0 (facing east), clamped beyond. */
const wallColour = (deg: number) => {
  const k = Math.min(1, Math.max(0, 1 - deg / 90))
  return `rgb(${SOUTH.map((c, i) => Math.round(c + (EAST[i] - c) * k)).join(',')})`
}

const ARC_STEPS = 6

/**
 * One quarter-circle corner of the slab's wall, as a fan of narrow upright panels. `from`..`to` are degrees, measured from east
 * towards south (y points down), round a centre (cx, cy). A panel is stood up like the straight walls (rotateX(-90deg) hangs it
 * below the top face), inside a box turned about z so that it faces outward.
 */
function Corner({ cx, cy, r, t, from, to }: { cx: number; cy: number; r: number; t: number; from: number; to: number }) {
  const rad = (d: number) => (d * Math.PI) / 180
  return (
    <>
      {Array.from({ length: ARC_STEPS }, (_, i) => {
        const a0 = from + ((to - from) * i) / ARC_STEPS
        const a1 = from + ((to - from) * (i + 1)) / ARC_STEPS
        const mid = (a0 + a1) / 2
        const phi = mid - 90
        const len = 2 * r * Math.sin(rad(Math.abs(a1 - a0)) / 2)
        // the panel starts half a chord back along its own direction from the arc's midpoint
        const sx = cx + r * Math.cos(rad(mid)) - (len / 2) * Math.cos(rad(phi))
        const sy = cy + r * Math.sin(rad(mid)) - (len / 2) * Math.sin(rad(phi))
        return (
          <div
            key={i}
            className="absolute"
            style={{ left: sx, top: sy, width: 0, height: 0, transformOrigin: '0 0', transform: `rotateZ(${phi}deg)`, transformStyle: 'preserve-3d' }}
          >
            <div
              className="absolute"
              style={{
                left: 0,
                top: 0,
                width: len + 1, // a pixel of overlap, so no hairline shows between panels
                height: t,
                transformOrigin: '0 0',
                transform: 'rotateX(-90deg)',
                background: wallColour(mid),
                backfaceVisibility: 'hidden',
              }}
            />
          </div>
        )
      })}
    </>
  )
}

export default function Modules({ onRef, onConnector }: ModulesProps) {
  return (
    <div className="absolute" style={{ left: 0, top: 0, width: 0, height: 0, transformStyle: 'preserve-3d' }}>
      {MODULES.map((m) => {
        const t = m.thick * W
        return (
          <div key={m.id} className="absolute" style={{ left: 0, top: 0, width: 0, height: 0, transformStyle: 'preserve-3d' }}>
            <div
              ref={(el) => onRef?.(m.id, el)}
              data-module={m.id}
              className="absolute"
              style={{ left: m.x - m.w / 2, top: m.y - m.h / 2, width: m.w, height: m.h, transformStyle: 'preserve-3d' }}
            >
              <div
                data-face="top"
                className="absolute inset-0 overflow-hidden bg-white"
                style={{ borderRadius: MODULE_RADIUS, boxShadow: 'inset 0 0 0 1px rgba(60,80,120,.18)' }}
              >
                <img alt="" src={asset(`assets/images/mas-iso/${m.image}`)} className="block size-full object-fill" />
              </div>
              {/* Walls: straight between the corners, then a fan of panels round each of the three corners the view can see. */}
              <div data-face="south" className="absolute" style={{ left: MODULE_RADIUS, top: m.h, width: m.w - 2 * MODULE_RADIUS, height: t, transformOrigin: '0 0', transform: 'rotateX(-90deg)', background: '#cfd6e4' }} />
              <div data-face="east" className="absolute" style={{ left: m.w, top: MODULE_RADIUS, width: t, height: m.h - 2 * MODULE_RADIUS, transformOrigin: '0 0', transform: 'rotateY(90deg)', background: '#8c97ad' }} />
              <Corner cx={m.w - MODULE_RADIUS} cy={m.h - MODULE_RADIUS} r={MODULE_RADIUS} t={t} from={0} to={90} />
              <Corner cx={MODULE_RADIUS} cy={m.h - MODULE_RADIUS} r={MODULE_RADIUS} t={t} from={90} to={180} />
              <Corner cx={m.w - MODULE_RADIUS} cy={MODULE_RADIUS} r={MODULE_RADIUS} t={t} from={-90} to={0} />
            </div>
            {LINES.map(([colour, dx]) => (
              <div
                key={colour}
                ref={(el) => onConnector?.(`${m.id}:${colour}`, el)}
                data-connector={`${m.id}:${colour}`}
                className="absolute"
                style={{ left: m.x + dx - 1.5, top: 0, width: 3, height: 0, background: colour, transformOrigin: '0 0' }}
              />
            ))}
          </div>
        )
      })}
    </div>
  )
}
