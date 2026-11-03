import type { ReactNode } from 'react'

type TopicRowProps = {
  title: ReactNode
  children: ReactNode
  /** `narrow` matches the solution chapters, `wide` the process chapters. */
  label?: 'narrow' | 'wide'
  className?: string
  /** Anchor for the section nav; on the row, not the (possibly sticky) heading. */
  id?: string
  /** Desktop: pin the heading to the top of the viewport while the rest of its row scrolls past. */
  sticky?: boolean
}

/** Two-column row: a short heading on the left, the story on the right. */
export default function TopicRow({ title, children, label = 'narrow', className = '', id, sticky = false }: TopicRowProps) {
  const columns = label === 'narrow' ? 'lg:grid-cols-[263px_1fr] lg:gap-x-20' : 'lg:grid-cols-[300px_1fr] lg:gap-x-16'
  return (
    <div id={id} className={`grid gap-6 ${columns} ${className}`}>
      {/* Sticky needs `self-start`: a grid item stretched to the row's full height has no room to travel. */}
      <h3 className={`type-topic ${sticky ? 'lg:sticky lg:top-16 lg:self-start' : ''}`}>{title}</h3>
      <div className="min-w-0">{children}</div>
    </div>
  )
}
