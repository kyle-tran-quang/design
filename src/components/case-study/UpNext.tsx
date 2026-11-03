import Reveal from '@/components/motion/Reveal'
import { homeHref } from '@/lib/routes'
import DarkButton from './DarkButton'
import { contentFrame } from './frame'

type UpNextProps = {
  href: string
  title: string
  image: string
}

export default function UpNext({ href, title, image }: UpNextProps) {
  return (
    <section aria-labelledby="up-next" className="bg-cloud pt-10 pb-16 lg:pb-[74px]">
      <div className={contentFrame}>
        <DarkButton href={homeHref} icon="back">
          Go back Home
        </DarkButton>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px] lg:gap-x-20">
          <h2 id="up-next" className="type-lede text-ink">
            Up next:
          </h2>
          <Reveal preset="zoom" className="max-w-[360px]">
          <a href={href} className="block">
            <div className="aspect-[360/337] overflow-hidden rounded-xl bg-[#e6e6e3]">
              <img
                src={image}
                alt=""
                loading="lazy"
                className="size-full object-cover"
              />
            </div>
            <h3 className="mt-[35px] px-5 type-topic text-ink">{title}</h3>
          </a>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
