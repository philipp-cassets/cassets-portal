/**
 * Section head in the report style: a 96px ultra-light ghost number behind
 * a hairline-ruled caps title. Page numbering is fixed across the portal:
 * 01 Position, 02 Activity, 03 Documents, 04 News, 05 Transparency.
 */
export function SectionHead({ num, title }: { num: string; title: string }) {
  return (
    <div className="section-head">
      <div className="section-ghost" aria-hidden="true">
        {num}
      </div>
      <div className="section-title">
        {num}
        <span className="slash">/</span>
        {title}
      </div>
      <div className="section-rule" />
    </div>
  );
}
