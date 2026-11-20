import { useState } from 'react'
import { MotionConfig } from 'motion/react'
import ProjectNav from '@/components/ProjectNav'
import CaseStudyHero from '@/components/case-study/CaseStudyHero'
import ContactFooter from '@/components/case-study/ContactFooter'
import UpNext from '@/components/case-study/UpNext'
import LazyWhenNear from '@/components/LazyWhenNear'
import MasCinematic from '@/components/case-study/mas/MasCinematic'
import { asset } from '@/lib/asset'
import { workHref } from '@/lib/routes'

// The isometric system showcase: pinned, scroll-scrubbed. Its code loads only as the reader nears it. It replaces the long
// page (problem, solution, process): each of its stories carries that content. The old page is kept in
// ref-mas-pricing/MasPricingV2.long-page.tsx.txt.
const loadIsoShowcase = () => import('@/components/case-study/mas/iso/IsoShowcase')

export default function MasPricingV2() {
  // The cinematic covers the page on load; the header's entrance starts as it slides away.
  const [revealed, setRevealed] = useState(false)

  return (
    // Framer honours the OS "reduce motion" setting; so do these effects.
    <MotionConfig reducedMotion="user">
    <div className="overflow-x-clip bg-snow">
      <MasCinematic onOut={() => setRevealed(true)} />
      <ProjectNav />

      <CaseStudyHero
        title="IBM Maximo Pricing Estimator"
        summary="Redesigning the quote-to-deal workflow for IBM Maximo sellers to cut down 30% deal process time with enterprise clients within 3 months of launch."
        image={asset('assets/images/mas-pricing-hero-isometric-mockup.webp')}
        play={revealed}
        role="UX Designer"
        timeline="Feb - Jul 2026"
      />

      <main>
        {/* The system: pinned isometric showcase. Scrolling past it goes to the next case study. */}
        <LazyWhenNear load={loadIsoShowcase} fallback={<div className="h-screen bg-[#e4e5e8]" />} rootMargin="600px 0px" />

      </main>

      <UpNext
        href={workHref('cardoctor')}
        title="Design (rescue) CarDoctor to boost revenue to $1M"
        image={asset('assets/images/shared-card-cardoctor.avif')}
      />
      <ContactFooter />
    </div>
    </MotionConfig>
  )
}
