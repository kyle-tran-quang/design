import { useRef } from 'react'
import AboutMe from '@/components/home/AboutMe'
import Contact from '@/components/home/Contact'
import Hero from '@/components/home/Hero'
import Playground from '@/components/home/Playground'
import Projects from '@/components/home/Projects'
import { useHorizontalScroll } from '@/hooks/useHorizontalScroll'
import { useHomeScrollMemory } from '@/hooks/useHomeScrollMemory'

/**
 * Homepage. On large screens the sections sit side by side on one track that
 * scrolls horizontally; on smaller screens they stack and scroll normally.
 */
export default function Home() {
  const trackRef = useRef<HTMLDivElement>(null)
  useHorizontalScroll(trackRef)
  useHomeScrollMemory(trackRef)

  return (
    <div
      ref={trackRef}
      className="[--z:1] lg:no-scrollbar lg:h-dvh lg:overflow-x-auto lg:overflow-y-hidden lg:overscroll-x-none"
    >
      <main className="flex flex-col lg:h-[calc(100dvh/var(--z))] lg:w-max lg:flex-row lg:[zoom:var(--z)]">
        <Hero />
        <Projects />
        <Playground />
        <AboutMe />
        <Contact />
      </main>
    </div>
  )
}
