/**
 * Dependency-free inline-SVG NAV chart, rendered on the server.
 * Thin forest line over hairline axes with a terminal dot, in the manner
 * of the annual report. Values arrive as numeric strings from pg.
 */
export function Sparkline({
  values,
  startLabel,
  endLabel,
  width = 1080,
  height = 200,
}: {
  values: (string | number)[];
  startLabel?: string;
  endLabel?: string;
  width?: number;
  height?: number;
}) {
  const nums = values
    .map((v) => (typeof v === "number" ? v : Number(v)))
    .filter((n) => Number.isFinite(n));

  if (nums.length < 2) return null;

  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const span = max - min || 1;

  const left = 8;
  const right = width - 64; // room for the terminal value label
  const top = 16;
  const baseY = height - 44; // room for axis labels below
  const step = (right - left) / (nums.length - 1);

  const y = (n: number) => top + (1 - (n - min) / span) * (baseY - top);

  const points = nums
    .map((n, i) => `${(left + i * step).toFixed(1)},${y(n).toFixed(1)}`)
    .join(" ");

  const last = nums[nums.length - 1];
  const lastY = y(last);
  const baselineLabel = nums[0].toLocaleString("en-US", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  });
  const terminalLabel = last.toLocaleString("en-US", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  });

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Published NAV per unit, from ${baselineLabel} to ${terminalLabel}`}
    >
      {/* hairline axes */}
      <line x1={left} y1={baseY} x2={right} y2={baseY} stroke="var(--hairline)" strokeWidth="1" />
      <line x1={left} y1={top} x2={left} y2={baseY} stroke="var(--hairline)" strokeWidth="1" />
      {/* thin forest line */}
      <polyline
        points={points}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* terminal dot + value */}
      <circle cx={right} cy={lastY} r="2" fill="var(--accent)" />
      <text className="term-label" x={right + 12} y={lastY + 3.5}>
        {terminalLabel}
      </text>
      {/* axis labels */}
      <text className="ax-label" x={left} y={baseY + 16} textAnchor="start">
        {baselineLabel}
      </text>
      {startLabel && (
        <text className="ax-label" x={left} y={baseY + 32} textAnchor="start">
          {startLabel}
        </text>
      )}
      {endLabel && (
        <text className="ax-label" x={right} y={baseY + 32} textAnchor="end">
          {endLabel}
        </text>
      )}
    </svg>
  );
}
