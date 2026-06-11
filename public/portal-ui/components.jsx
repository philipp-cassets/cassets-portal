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
      { label: "Pending Orders", badge: PortalData.ORDERS_PENDING.length ? String(PortalData.ORDERS_PENDING.length) : null },
      { label: "Settled History" },
      { label: "Distributions" },
    ],
  },
  {
    id: "chain", label: "On-chain Transparency", icon: IcoShield, expandable: true, ticks: true,
    children: [
      { label: "Wallet Registry" },
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

function Sidebar({ collapsed, onToggleCollapse, route, onNav }) {
  const [open, setOpen] = useState({ subs: true, chain: true, statements: true });

  // DELTA-LOCAL §5: hover tooltips on the collapsed rail. Never rendered in
  // expanded mode; a short grace timer lets the pointer cross the 8px gap so
  // group children stay clickable.
  const [tip, setTip] = useState(null); // {top, item}
  const tipTimer = useRef(null);
  const showTip = (e, item) => {
    if (!collapsed) return;
    clearTimeout(tipTimer.current);
    const r = e.currentTarget.getBoundingClientRect();
    setTip({ top: r.top + r.height / 2, item });
  };
  const hideTip = () => {
    clearTimeout(tipTimer.current);
    tipTimer.current = setTimeout(() => setTip(null), 120);
  };
  const holdTip = () => clearTimeout(tipTimer.current);
  useEffect(() => {
    if (!collapsed) setTip(null);
  }, [collapsed]);

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
                className={"nav-item" + (route.screen === item.id && (!item.expandable || collapsed) ? " active" : "")}
                onMouseEnter={(e) => showTip(e, item)}
                onMouseLeave={hideTip}
                onClick={() => {
                  if (item.expandable) {
                    setOpen((o) => ({ ...o, [item.id]: route.screen === item.id ? !o[item.id] : true }));
                    if (route.screen !== item.id) onNav({ screen: item.id, sub: item.children[0].label });
                  } else onNav({ screen: item.id });
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
                    <div key={c.label}
                      className={"nav-child" + (item.ticks ? " tick" : "") + (route.screen === item.id && route.sub === c.label ? " active" : "")}
                      onClick={() => onNav({ screen: item.id, sub: c.label })}>
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

      {collapsed && tip ? (
        <div
          className="sb-tip"
          style={{ left: "96px", top: tip.top + "px" }}
          onMouseEnter={holdTip}
          onMouseLeave={hideTip}
        >
          <div>{tip.item.label}</div>
          {tip.item.children
            ? tip.item.children.map((c) => (
                <div
                  key={c.label}
                  className="tt-child"
                  onClick={() => {
                    onNav({ screen: tip.item.id, sub: c.label });
                    setOpen((o) => ({ ...o, [tip.item.id]: true }));
                    setTip(null);
                  }}
                >
                  {c.label}
                </div>
              ))
            : null}
        </div>
      ) : null}
    </aside>
  );
}

/* ---------- Header ---------- */
function Header({ denom, onFlip, period, onPeriod }) {
  const [notifs, setNotifs] = useState(PortalData.NOTIFS);
  const [panel, setPanel] = useState(null); // 'date' | 'notif' | null
  const unread = notifs.filter((n) => !n.read).length;
  // Read-state is server-persisted per auth user (migration 014); the POSTs
  // are fire-and-forget and the dropdown updates optimistically.
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

        <div className="dd-anchor">
          <div className="card-pill date" style={{ cursor: "pointer" }} onClick={() => setPanel(panel === "date" ? null : "date")}>
            <span>{period}</span>
            <IcoChevron size={14}></IcoChevron>
          </div>
          {panel === "date" ? (
            <React.Fragment>
              <div className="dd-veil" onClick={() => setPanel(null)}></div>
              <div className="dd-panel" style={{ minWidth: "240px" }}>
                {PortalData.PERIODS.map((p) => (
                  <div key={p} className={"dd-row" + (p === period ? " unread" : "")} onClick={() => { onPeriod(p); setPanel(null); }}>
                    <span className="tnum">{p}</span>
                    {p === period ? <span className="udot"></span> : null}
                  </div>
                ))}
              </div>
            </React.Fragment>
          ) : null}
        </div>

        <div className="dd-anchor">
          <div className="card-pill notif" style={{ cursor: "pointer" }} onClick={() => setPanel(panel === "notif" ? null : "notif")}>
            <span className="bell-wrap">
              <IcoBell size={18}></IcoBell>
              {unread > 0 ? <span className="bell-dot"></span> : null}
            </span>
            <span>{PortalData.HEADER.today}</span>
            {unread > 0 ? <span className="notif-badge tnum">{unread}</span> : null}
          </div>
          {panel === "notif" ? (
            <React.Fragment>
              <div className="dd-veil" onClick={() => setPanel(null)}></div>
              <div className="dd-panel" style={{ minWidth: "340px" }}>
                {notifs.map((n, i) => (
                  <div key={i} className={"dd-row" + (n.read ? "" : " unread")}
                    onClick={() => {
                      if (!n.read) PortalData.markNotifRead(n.id);
                      setNotifs((xs) => xs.map((x, j) => j === i ? { ...x, read: true } : x));
                    }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                      {!n.read ? <span className="udot"></span> : null}
                      <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n.t}</span>
                    </span>
                    <span className="d tnum">{n.d}</span>
                  </div>
                ))}
                <div className="dd-foot">
                  <button className="pt-quiet" onClick={() => {
                    PortalData.markAllNotifsRead();
                    setNotifs((xs) => xs.map((x) => ({ ...x, read: true })));
                  }}>Mark all read</button>
                </div>
              </div>
            </React.Fragment>
          ) : null}
        </div>
      </div>
    </header>
  );
}

Object.assign(window, { Money, Sidebar, Header });
