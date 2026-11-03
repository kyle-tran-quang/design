import { about } from "@/content/home"
import { asset } from "@/lib/asset"
import { PillDivider } from "./Dividers"

export default function AboutMe() {
  return (
    <section
      id="aboutme"
      aria-labelledby="aboutme-title"
      className="flex shrink-0 flex-col items-center gap-10 px-6 pt-24 pb-16 sm:px-10 md:flex-row md:justify-center md:gap-12 lg:h-full lg:justify-start lg:gap-0 lg:px-0 lg:pt-0 lg:pr-20 lg:pb-0"
    >
      <PillDivider />
      <div className="w-full max-w-[460px] md:flex-1 lg:ml-20 lg:w-[460px] lg:flex-none">
        <h2 id="aboutme-title" className="type-display font-medium text-accent">
          {about.title}
        </h2>
        <p className="mt-6 type-subtopic text-ink lg:mt-8">{about.body}</p>
      </div>
      <img
        src={asset("assets/images/home-about-me-portrait.webp")}
        alt="Illustrated self-portrait of Kyle waving hi from a browser window"
        width={512}
        height={512}
        loading="lazy"
        decoding="async"
        className="w-full max-w-[400px] md:w-2/5 md:shrink-0 lg:ml-[81px] lg:w-[400px]"
      />
    </section>
  )
}
