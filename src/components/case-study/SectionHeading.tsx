type SectionHeadingProps = {
  eyebrow: string
  title: string
  id?: string
}

/** "— THE PROBLEM" style label above a large section title. */
export default function SectionHeading({ eyebrow, title, id }: SectionHeadingProps) {
  return (
    <hgroup>
      <p className="type-eyebrow">{eyebrow}</p>
      <h2 id={id} className="mt-2 type-section-title">{title}</h2>
    </hgroup>
  )
}
