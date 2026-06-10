/* Minimal lucide-style stroke icon set for the portal. All 24×24 viewBox, stroke currentColor. */

function Icon({ size = 18, children, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={style}>
      {children}
    </svg>
  );
}

const IcoPanel = (p) => (
  <Icon {...p}>
    <rect x="3" y="4" width="18" height="16" rx="3"></rect>
    <path d="M9.5 4v16"></path>
    <path d="M15 10l-2 2 2 2"></path>
  </Icon>
);

const IcoSearch = (p) => (
  <Icon {...p} size={p.size || 13}>
    <circle cx="11" cy="11" r="7"></circle>
    <path d="M20 20l-4-4"></path>
  </Icon>
);

const IcoGrid = (p) => (
  <Icon {...p}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.5"></rect>
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.5"></rect>
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.5"></rect>
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.5"></rect>
  </Icon>
);

const IcoPie = (p) => (
  <Icon {...p}>
    <path d="M21 12A9 9 0 1 1 12 3"></path>
    <path d="M12 3a9 9 0 0 1 9 9h-9z"></path>
  </Icon>
);

const IcoLayers = (p) => (
  <Icon {...p}>
    <path d="M12 3l9 5-9 5-9-5z"></path>
    <path d="M3 13l9 5 9-5"></path>
  </Icon>
);

const IcoArrows = (p) => (
  <Icon {...p}>
    <path d="M4 8h13"></path>
    <path d="M14 4.5L17.5 8 14 11.5"></path>
    <path d="M20 16H7"></path>
    <path d="M10 12.5L6.5 16l3.5 3.5"></path>
  </Icon>
);

const IcoShield = (p) => (
  <Icon {...p}>
    <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"></path>
  </Icon>
);

const IcoFile = (p) => (
  <Icon {...p}>
    <path d="M6 3h8l4 4v14H6z"></path>
    <path d="M14 3v4h4"></path>
  </Icon>
);

const IcoChevron = (p) => (
  <Icon {...p} size={p.size || 16}>
    <path d="M6 9l6 6 6-6"></path>
  </Icon>
);

const IcoBell = (p) => (
  <Icon {...p}>
    <path d="M6 9a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 13 6 9z"></path>
    <path d="M10 18.5a2.2 2.2 0 0 0 4 0"></path>
  </Icon>
);

const IcoBolt = (p) => (
  <Icon {...p}>
    <path d="M13 2L5 14h6l-1 8 8-12h-6z"></path>
  </Icon>
);

const IcoTrend = (p) => (
  <Icon {...p} size={p.size || 11}>
    <path d="M5 19L19 5"></path>
    <path d="M9 5h10v10"></path>
  </Icon>
);

const IcoStar4 = (p) => (
  <svg width={p.size || 16} height={p.size || 16} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 1c1 6.5 4.5 10 11 11-6.5 1-10 4.5-11 11-1-6.5-4.5-10-11-11 6.5-1 10-4.5 11-11z"></path>
  </svg>
);

/* sleeve glyphs */
const IcoCalls = (p) => (
  <Icon {...p} size={p.size || 20}>
    <path d="M5 19h14"></path>
    <path d="M6 15L17 6"></path>
    <path d="M10.5 5.5H17.5V12.5"></path>
  </Icon>
);

const IcoStake = (p) => (
  <Icon {...p} size={p.size || 20}>
    <ellipse cx="12" cy="6.5" rx="7" ry="2.8"></ellipse>
    <path d="M5 6.5v5.5c0 1.55 3.13 2.8 7 2.8s7-1.25 7-2.8V6.5"></path>
    <path d="M5 12v5.5c0 1.55 3.13 2.8 7 2.8s7-1.25 7-2.8V12"></path>
  </Icon>
);

const IcoFree = (p) => (
  <Icon {...p} size={p.size || 20}>
    <circle cx="12" cy="12" r="8.5"></circle>
    <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"></circle>
  </Icon>
);

/* desk icons */
const IcoCandle = (p) => (
  <Icon {...p}>
    <path d="M7 6v12"></path><rect x="4.5" y="8.5" width="5" height="6" rx="1"></rect>
    <path d="M17 4v14"></path><rect x="14.5" y="7" width="5" height="7.5" rx="1"></rect>
  </Icon>
);
const IcoAlert = (p) => (
  <Icon {...p}>
    <path d="M12 4L2.5 20h19z"></path><path d="M12 10.5v4"></path>
    <circle cx="12" cy="17.3" r="0.4" fill="currentColor"></circle>
  </Icon>
);
const IcoVault = (p) => (
  <Icon {...p}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2"></rect>
    <circle cx="12" cy="12" r="3.6"></circle>
    <path d="M12 9.6v-1.4M12 15.8v-1.4M14.4 12h1.4M8.2 12h1.4"></path>
  </Icon>
);
const IcoPeople = (p) => (
  <Icon {...p}>
    <circle cx="9" cy="8.5" r="3"></circle>
    <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5"></path>
    <path d="M16 5.8a3 3 0 0 1 0 5.4M17.5 14.3c1.8.8 3 2.4 3 4.7"></path>
  </Icon>
);
const IcoMegaphone = (p) => (
  <Icon {...p}>
    <path d="M3.5 10v4l13 5V5z"></path>
    <path d="M16.5 8.5a4 4 0 0 1 0 7"></path>
    <path d="M7 14.5V19"></path>
  </Icon>
);
const IcoPulse = (p) => (
  <Icon {...p}>
    <path d="M2.5 12h4l2.5-6 4 12 2.5-6h6"></path>
  </Icon>
);

Object.assign(window, {
  Icon, IcoPanel, IcoSearch, IcoGrid, IcoPie, IcoLayers, IcoArrows, IcoShield,
  IcoFile, IcoChevron, IcoBell, IcoBolt, IcoTrend, IcoStar4, IcoCalls, IcoStake, IcoFree,
  IcoCandle, IcoAlert, IcoVault, IcoPeople, IcoMegaphone, IcoPulse,
});
