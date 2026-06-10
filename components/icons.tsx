/**
 * Stroke icon set ported from the design handoff
 * (design/portal/icons.jsx). All 24x24 viewBox, 1.7px stroke,
 * currentColor. Plain functions, usable from server and client
 * components alike.
 */

type IconProps = {
  size?: number;
  style?: React.CSSProperties;
};

function Icon({
  size = 18,
  style,
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const IcoPanel = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="4" width="18" height="16" rx="3" />
    <path d="M9.5 4v16" />
    <path d="M15 10l-2 2 2 2" />
  </Icon>
);

export const IcoSearch = (p: IconProps) => (
  <Icon {...p} size={p.size ?? 13}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-4-4" />
  </Icon>
);

export const IcoGrid = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
  </Icon>
);

export const IcoPie = (p: IconProps) => (
  <Icon {...p}>
    <path d="M21 12A9 9 0 1 1 12 3" />
    <path d="M12 3a9 9 0 0 1 9 9h-9z" />
  </Icon>
);

export const IcoLayers = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3l9 5-9 5-9-5z" />
    <path d="M3 13l9 5 9-5" />
  </Icon>
);

export const IcoArrows = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 8h13" />
    <path d="M14 4.5L17.5 8 14 11.5" />
    <path d="M20 16H7" />
    <path d="M10 12.5L6.5 16l3.5 3.5" />
  </Icon>
);

export const IcoShield = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
  </Icon>
);

export const IcoFile = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 3h8l4 4v14H6z" />
    <path d="M14 3v4h4" />
  </Icon>
);

export const IcoChevron = (p: IconProps) => (
  <Icon {...p} size={p.size ?? 16}>
    <path d="M6 9l6 6 6-6" />
  </Icon>
);

export const IcoBell = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 9a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 13 6 9z" />
    <path d="M10 18.5a2.2 2.2 0 0 0 4 0" />
  </Icon>
);

export const IcoBolt = (p: IconProps) => (
  <Icon {...p}>
    <path d="M13 2L5 14h6l-1 8 8-12h-6z" />
  </Icon>
);

export const IcoTrend = (p: IconProps) => (
  <Icon {...p} size={p.size ?? 11}>
    <path d="M5 19L19 5" />
    <path d="M9 5h10v10" />
  </Icon>
);

export const IcoStar4 = (p: IconProps) => (
  <svg
    width={p.size ?? 16}
    height={p.size ?? 16}
    viewBox="0 0 24 24"
    fill="currentColor"
    style={p.style}
    aria-hidden="true"
  >
    <path d="M12 1c1 6.5 4.5 10 11 11-6.5 1-10 4.5-11 11-1-6.5-4.5-10-11-11 6.5-1 10-4.5 11-11z" />
  </svg>
);

/* sleeve glyphs */
export const IcoCalls = (p: IconProps) => (
  <Icon {...p} size={p.size ?? 20}>
    <path d="M5 19h14" />
    <path d="M6 15L17 6" />
    <path d="M10.5 5.5H17.5V12.5" />
  </Icon>
);

export const IcoStake = (p: IconProps) => (
  <Icon {...p} size={p.size ?? 20}>
    <ellipse cx="12" cy="6.5" rx="7" ry="2.8" />
    <path d="M5 6.5v5.5c0 1.55 3.13 2.8 7 2.8s7-1.25 7-2.8V6.5" />
    <path d="M5 12v5.5c0 1.55 3.13 2.8 7 2.8s7-1.25 7-2.8V12" />
  </Icon>
);

export const IcoFree = (p: IconProps) => (
  <Icon {...p} size={p.size ?? 20}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
  </Icon>
);

export const IcoMegaphone = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3.5 10v4l13 5V5z" />
    <path d="M16.5 8.5a4 4 0 0 1 0 7" />
    <path d="M7 14.5V19" />
  </Icon>
);
