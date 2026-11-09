import { asset } from '@/lib/asset'

/**
 * The pinned hero. It keeps the old page's custom pin-and-morph into the stage (the engine's hero-transition measures
 * #heroSlot and animates #heroBox), but its type scale matches CaseStudyHero in the design project: IBM Plex Mono light
 * italic 68px / -0.05em title, 24px muted summary, Role / Timeline meta row.
 */
export default function MGoatHero() {
  return (
    <div className="hero-track" id="heroTrack">
      <div className="hero-pin" id="heroPin">
        <header className="hero" id="hero">
          <div className="hero-image" id="heroSlot" />
          <div className="hero-body">
            <h1 className="hero-title">
              IBM Maximo
              <br />
              Growth Assessment Tool
            </h1>
            <div className="hero-side">
              <p className="hero-desc">
                Designing an internal enablement tool that helps Maximo sellers guide customers to use more of what they
                already own, so customers see more value from their investment.
              </p>
              <dl className="hero-meta">
                <div>
                  <dt>Role</dt>
                  <dd>UX Designer</dd>
                </div>
                <div>
                  <dt>Timeline</dt>
                  <dd>Feb - Jul 2026</dd>
                </div>
              </dl>
            </div>
          </div>
        </header>
        <div
          className="hero-box"
          id="heroBox"
          role="img"
          aria-label="Preview of the growth roadmap report: a tilted screen showing the Maximo growth roadmap, a flow diagram, and a 48% readiness card."
        >
          <img src={asset('assets/mgoat/hero/hero.webp')} alt="" decoding="async" />
          <div className="tint" />
        </div>
      </div>
    </div>
  )
}
