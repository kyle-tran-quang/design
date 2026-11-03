import ElasticLine from '../ElasticLine'

/** Interactive pill that separates groups on the horizontal track. */
export function ElasticDivider() {
  return (
    <div className="hidden h-[361px] w-[129px] shrink-0 self-center lg:block">
      <ElasticLine className="block size-full" />
    </div>
  )
}

/** Quiet outlined pill used between smaller groups. */
export function PillDivider() {
  return (
    <div
      aria-hidden="true"
      className="hidden h-[196px] w-[73px] shrink-0 self-center rounded-full border border-line lg:block"
    />
  )
}
