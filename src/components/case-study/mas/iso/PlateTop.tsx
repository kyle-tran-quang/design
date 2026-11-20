import { CUBE, QUAD_H, QUAD_W, QUADS } from './reveal'

/**
 * The top of the rationale plate: a 2 x 2 platform, one colour a quadrant, as in clip 05 (light blue, white, and two blues, deepest at the
 * right). Every quadrant carries an inset outline square. On the two that have a cube the outline is the cube's lid (see PlateCubes), so
 * it is drawn there; on the other two it stays a plain outline.
 */
export default function PlateTop() {
  return (
    <div className="absolute inset-0">
      {QUADS.map((q) => (
        <div key={q.id} className="absolute" style={{ left: q.x, top: q.y, width: QUAD_W, height: QUAD_H, background: q.colour }}>
          {!('cube' in q) && (
            <div
              className="absolute"
              style={{
                left: (QUAD_W - CUBE) / 2,
                top: (QUAD_H - CUBE) / 2,
                width: CUBE,
                height: CUBE,
                boxShadow: 'inset 0 0 0 1.5px rgba(30,50,110,.4)',
              }}
            />
          )}
        </div>
      ))}
    </div>
  )
}
