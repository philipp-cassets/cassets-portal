/**
 * Section head in the Analitica voice: a thin grey label row with a small
 * four-point star glyph, like the target's "Capital under control" eyebrow.
 * No ghost page numbers - those belonged to the previous design.
 */
export function SectionHead({ title }: { title: string }) {
  return (
    <div className="section-head">
      <span className="section-glyph" aria-hidden="true">
        &#10022;
      </span>
      <span className="section-title">{title}</span>
    </div>
  );
}
