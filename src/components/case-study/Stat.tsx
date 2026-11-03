type StatProps = {
  value: string
  children: string
  /** Let the caption run the full column width. */
  wide?: boolean
  className?: string
}

export default function Stat({ value, children, wide = false, className = '' }: StatProps) {
  return (
    <div className={className}>
      <p className="type-stat">{value}</p>
      <p className={`mt-2 type-caption text-muted ${wide ? 'max-w-[31rem]' : 'max-w-[15rem]'}`}>{children}</p>
    </div>
  )
}
