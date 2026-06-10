/**
 * Dependency-free inline-SVG sparkline, rendered on the server.
 * Values arrive as numeric strings from pg.
 */
export function Sparkline({
  values,
  width = 240,
  height = 52,
}: {
  values: (string | number)[];
  width?: number;
  height?: number;
}) {
  const nums = values
    .map((v) => (typeof v === "number" ? v : Number(v)))
    .filter((n) => Number.isFinite(n));

  if (nums.length < 2) return null;

  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const pad = 4;
  const span = max - min || 1;
  const step = (width - pad * 2) / (nums.length - 1);

  const points = nums
    .map((n, i) => {
      const x = pad + i * step;
      const y = pad + (1 - (n - min) / span) * (height - pad * 2);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  const last = nums[nums.length - 1];
  const lastX = pad + (nums.length - 1) * step;
  const lastY = pad + (1 - (last - min) / span) * (height - pad * 2);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="NAV history"
    >
      <polyline
        points={points}
        fill="none"
        stroke="#3e4c5e"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={lastX} cy={lastY} r="2.5" fill="#3e4c5e" />
    </svg>
  );
}
