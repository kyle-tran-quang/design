type PullQuoteProps = {
  quote: string
  source: string
  className?: string
}

export default function PullQuote({ quote, source, className = '' }: PullQuoteProps) {
  return (
    <figure className={`max-w-[32rem] ${className}`}>
      <blockquote className="type-quote text-accent">"{quote}"</blockquote>
      <figcaption className="mt-5 type-caption text-dim">— {source}</figcaption>
    </figure>
  )
}
