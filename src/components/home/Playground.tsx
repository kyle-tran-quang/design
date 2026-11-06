import { playground } from "@/content/home"
import { asset } from "@/lib/asset"
import AutoplayVideo from "../AutoplayVideo"
import DiscRig from "../DiscRig"
import { ElasticDivider } from "./Dividers"
import SectionIntro from "./SectionIntro"

const MEDIA_CLASS =
  "aspect-[320/308] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] lg:aspect-auto lg:h-full"

export default function Playground() {
  return (
    <section
      id="playground"
      aria-label="Playground"
      className="flex shrink-0 flex-col gap-12 px-6 pt-24 sm:px-10 lg:h-full lg:flex-row lg:items-center lg:gap-20 lg:pt-0 lg:pr-20 lg:pl-10"
    >
      <SectionIntro index="02/" title="Playground">
        <DiscRig className="w-full max-w-[304px]" />
      </SectionIntro>

      <ElasticDivider />

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:w-[1328px] lg:shrink-0 lg:grid-cols-4">
        {playground.map((item) => (
          <li key={item.image}>
            <figure className="group relative overflow-hidden rounded-tr-[28px] bg-cloud lg:h-[308px]">
              {item.image.endsWith(".mp4") ? (
                <AutoplayVideo
                  src={asset(item.image)}
                  poster={item.poster && asset(item.poster)}
                  className={MEDIA_CLASS}
                />
              ) : (
                <img
                  src={asset(item.image)}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className={MEDIA_CLASS}
                />
              )}
              <figcaption className="border-t border-mist bg-white px-4 py-4 type-small text-graphite lg:absolute lg:inset-x-0 lg:bottom-0 lg:translate-y-full lg:bg-white/95 lg:backdrop-blur-sm lg:transition-transform lg:duration-500 lg:ease-out lg:group-hover:translate-y-0">
                {item.caption}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  )
}
