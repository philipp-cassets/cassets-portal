/* Sidebar + Header components */

const { useState, useEffect, useRef, useMemo, useCallback } = React;

/* ---------- Money: ghost-decimal numeral renderer ---------- */
function Money({ value, denom, className = "", ghostClass = "ghost" }) {
  const p = PortalData.parts(value, denom);
  return (
    <span className={"tnum " + className}>
      {p.prefix}{p.int}<span className={ghostClass}>{p.dec}</span>
      {p.suffix ? <span className="suffix">{p.suffix}</span> : null}
    </span>
  );
}

/* ---------- Sidebar ---------- */
const NAV = [
  { id: "dashboard", label: "Dashboard", icon: IcoGrid, badge: "2" },
  { id: "nav", label: "NAV & Performance", icon: IcoPie },
  { id: "positions", label: "My Positions", icon: IcoLayers },
  {
    id: "subs", label: "Subscriptions & Redemptions", icon: IcoArrows, expandable: true,
    children: [
      { label: "Pending Orders", badge: "4" },
      { label: "Settled History" },
      { label: "Distributions" },
    ],
  },
  {
    id: "chain", label: "On-chain Transparency", icon: IcoShield, expandable: true, ticks: true,
    children: [
      { label: "Wallet Registry" },
      { label: "Staking Positions" },
      { label: "Venue Balances" },
      { label: "Proof of Reserves" },
    ],
  },
  {
    id: "statements", label: "Statements", icon: IcoFile, expandable: true, dim: true,
    children: [
      { label: "Monthly Statements" },
      { label: "Confirmations" },
      { label: "Tax Reports" },
    ],
  },
];

function Sidebar({ collapsed, onToggleCollapse }) {
  const [open, setOpen] = useState({ subs: true, chain: true, statements: true });
  const [active, setActive] = useState("dashboard");

  return (
    <aside className={"sidebar" + (collapsed ? " collapsed" : "")} data-screen-label="Sidebar">
      <div className="sb-top">
        <div className="sb-logo" aria-label="cNEAR"><span>c</span><b>NEAR</b></div>
        <div className="sb-id sb-fade">
          <div className="t1">cAssets</div>
          <div className="t2">cNEAR Investor Portal</div>
        </div>
        <button className="sb-collapse" onClick={onToggleCollapse} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          <IcoPanel size={17}></IcoPanel>
        </button>
      </div>
      <div className="sb-hair"></div>

      <div className="sb-search">
        <span className="chip"><IcoSearch size={13}></IcoSearch></span>
        <input className="sb-fade" type="text" placeholder="Searching" aria-label="Search" />
        <span className="hint sb-fade">ctrl + F</span>
      </div>

      <nav className="nav">
        {NAV.map((item) => {
          const ItemIcon = item.icon;
          const isOpen = !!open[item.id];
          return (
            <React.Fragment key={item.id}>
              <div
                className="nav-item"
                onClick={() => {
                  setActive(item.id);
                  if (item.expandable) setOpen((o) => ({ ...o, [item.id]: !o[item.id] }));
                }}
              >
                <span className="ico"><ItemIcon size={18}></ItemIcon></span>
                <span className="lbl sb-fade">{item.label}</span>
                {item.badge ? <span className="cnt sb-fade tnum">{item.badge}</span> : null}
                {item.expandable ? (
                  <span className={"chev sb-fade" + (isOpen ? " up" : "")}><IcoChevron size={15}></IcoChevron></span>
                ) : null}
              </div>
              {item.children && isOpen ? (
                <div className={"nav-children" + (item.ticks ? " ticks" : "") + (item.dim ? " dim" : "")}>
                  {item.children.map((c) => (
                    <div key={c.label} className={"nav-child" + (item.ticks ? " tick" : "")}>
                      <span>{c.label}</span>
                      {c.badge ? <span className="ckbadge tnum">{c.badge}</span> : null}
                    </div>
                  ))}
                </div>
              ) : null}
            </React.Fragment>
          );
        })}
      </nav>
    </aside>
  );
}

/* ---------- Header ---------- */
function Header({ denom, onFlip }) {
  return (
    <header className="header" data-screen-label="Header">
      <div className="hl">
        <div className="avatar" aria-label="Investor avatar placeholder">{PortalData.INVESTOR.initials}</div>
        <div>
          <div className="l1">
            <span className="code">{PortalData.INVESTOR.code}</span>
            <span className="pill-flat">VERIFIED</span>
          </div>
          <div className="l2">{PortalData.INVESTOR.name}</div>
        </div>
      </div>

      <div className="hr">
        <div className="denom">
          <span className={"dl " + (denom === "USD" ? "on" : "off")}>USD</span>
          <button
            className={"track" + (denom === "NEAR" ? " near" : "")}
            onClick={onFlip}
            aria-label={"Switch denomination to " + (denom === "USD" ? "NEAR" : "USD")}
          >
            <span className="knob"></span>
          </button>
          <span className={"dl " + (denom === "NEAR" ? "on" : "off")}>NEAR</span>
        </div>

        <div className="card-pill date">
          <span>{PortalData.HEADER.dateRange}</span>
          <IcoChevron size={14}></IcoChevron>
        </div>

        <div className="card-pill notif">
          <span className="bell-wrap">
            <IcoBell size={18}></IcoBell>
            <span className="bell-dot"></span>
          </span>
          <span>{PortalData.HEADER.today}</span>
          <span className="notif-badge tnum">{PortalData.HEADER.notifCount}</span>
        </div>
      </div>
    </header>
  );
}

Object.assign(window, { Money, Sidebar, Header });
