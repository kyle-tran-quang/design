/**
 * Text for `ScrollInk` to darken character by character. Each visible character is its own span; whitespace
 * stays plain text so lines still wrap between words. Screen readers get the plain string instead.
 */
export default function InkText({ children }: { children: string }) {
  return (
    <>
      <span className="sr-only">{children}</span>
      <span aria-hidden="true">
        {Array.from(children).map((char, i) =>
          /\s/.test(char) ? (
            char
          ) : (
            <span key={i} className="ink-char">
              {char}
            </span>
          ),
        )}
      </span>
    </>
  )
}
