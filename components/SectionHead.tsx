import { IcoStar4 } from "@/components/icons";

/**
 * Section head in the handoff's eyebrow voice: a small glyph at 35% black
 * next to a 19px/500 muted title, exactly like the dashboard KPI eyebrow.
 */
export function SectionHead({ title }: { title: string }) {
  return (
    <div className="section-head">
      <span className="ico" aria-hidden="true">
        <IcoStar4 size={16} />
      </span>
      <span className="t">{title}</span>
    </div>
  );
}
