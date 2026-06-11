/* Portal secondary screens: NAV & Performance, Positions, Subs & Redemptions,
   On-chain Transparency, Statements */

(function () {
  const { useState } = React;
  const P = PortalData;

  function ScreenHead({ title, sub }) {
    return (
      <div className="pt-head">
        <h1 className="pt-title">{title}</h1>
        {sub ? <div className="pt-sub tnum">{sub}</div> : null}
      </div>
    );
  }

  function Caps({ children, tone }) {
    return <span className={"pt-caps" + (tone ? " " + tone : "")}>{children}</span>;
  }

  // Every amount renders in its OWN denomination (USD, NEAR or units; the
  // page toggle never converts). Server-fed rows carry {v, unit}.
  function fmtAmt(amt) {
    const a = Math.abs(Number(amt.v));
    if (amt.unit === "units") return P.group(String(Math.round(a))) + " units";
    return P.full({ v: a, unit: amt.unit }, amt.unit);
  }

  /* ---------- NAV & Performance ---------- */
  function NavScreen({ denom }) {
    const GRID = "150px 1fr 170px 200px 110px";
    // Real v_portal_nav weekly strikes for the primary class of this
    // denomination; AUM in the class's own denomination, never merged.
    const T = P.NAV_TABLE[denom];
    return (
      <section>
        <ScreenHead title="NAV & Performance" sub={"Weekly NAV strikes · " + T.classLabel}></ScreenHead>
        <BarcodeChart denom={denom} timeframe="All"></BarcodeChart>
        <div className="pt-tbl" style={{ marginTop: "12px" }}>
          <div className="pt-th" style={{ gridTemplateColumns: GRID }}>
            <span>NAV date</span><span></span><span style={{ textAlign: "right" }}>NAV / unit</span>
            <span style={{ textAlign: "right" }}>Fund AUM</span><span style={{ textAlign: "right" }}>Change</span>
          </div>
          {T.rows.map((r, i) => (
            <div key={i} className="pt-tr" style={{ gridTemplateColumns: GRID }}>
              <span className="tnum">{r.date}</span><span></span>
              <span className="num tnum">{r.unitStr}</span>
              <span className="num tnum">{P.full(r.aum, denom)}</span>
              <span className={"num tnum" + (r.chg.charAt(0) === "+" ? " sage-txt" : " dim")}>{r.chg}</span>
            </div>
          ))}
        </div>
      </section>
    );
  }

  /* ---------- My Positions ---------- */
  function PositionsScreen({ denom }) {
    // MOCK: strategy-allocation sleeves have no portal view; prototype values
    // stay until the desk exposes one (see MOCK-FED INVENTORY in route.ts).
    const rows = [
      { sleeve: "Covered Calls", figure: 28500, share: "42%", note: "46 short calls across 9 expiries" },
      { sleeve: "Staking Yield", figure: 35200, share: "38%", note: "4 validators · rewards auto-compound" },
      { sleeve: "Unencumbered", figure: 24300, share: "20%", note: "free collateral, deployable" },
    ];
    const GRID = "1.2fr 200px 110px 1.6fr";
    return (
      <section>
        <ScreenHead title="My Positions" sub={"3 sleeves · NAV/unit " + P.FIGURES.navPerUnit[denom]}></ScreenHead>
        <div className="pt-tbl">
          <div className="pt-th" style={{ gridTemplateColumns: GRID }}>
            <span>Sleeve</span><span style={{ textAlign: "right" }}>Value</span>
            <span style={{ textAlign: "right" }}>Share</span><span>Detail</span>
          </div>
          {rows.map((r, i) => (
            <div key={i} className="pt-tr" style={{ gridTemplateColumns: GRID, height: "60px" }}>
              <span style={{ fontWeight: 500 }}>{r.sleeve}</span>
              <span className="num tnum" style={{ fontWeight: 600 }}>{P.full(r.figure, denom)}</span>
              <span className="num tnum dim">{r.share}</span>
              <span className="dim">{r.note}</span>
            </div>
          ))}
        </div>
        <div className="pt-note">Sleeve values update at each weekly NAV strike. Intraday figures are indicative.</div>
      </section>
    );
  }

  /* ---------- Subscriptions & Redemptions ---------- */
  function SubsScreen({ denom, sub }) {
    const tab = sub || "Pending Orders";
    const [placed, setPlaced] = useState(false);
    // Real pending orders (request views + AWAITING-NAV activity rows) from
    // the bridge; placing an order appends the server-verified readback row.
    const [orders, setOrders] = useState(P.ORDERS_PENDING);
    // New-order form. The CLASS select fixes the denomination: subscriptions
    // are amounts in the class's own denomination (USD or NEAR, never both);
    // redemptions are UNITS of the class. The page toggle plays no part.
    const classes = P.ORDER_CLASSES;
    const [kind, setKind] = useState("Subscription");
    const [clsIdx, setClsIdx] = useState(0);
    const [amount, setAmount] = useState("");
    const [error, setError] = useState(null);
    const cls = classes[clsIdx] || {};
    const amountLabel = kind === "Redemption" ? "AMOUNT · UNITS" : "AMOUNT · " + (cls.denom || "");
    const amountPh = kind === "Redemption" ? "units" : cls.denom === "NEAR" ? "NEAR" : "$";
    const placeOrder = () => {
      if (placed) return;
      const amt = Number(String(amount).replace(/[^0-9.]/g, ""));
      if (!cls.cls || !Number.isFinite(amt) || amt <= 0) {
        setError("Enter an amount greater than zero.");
        return;
      }
      setError(null);
      fetch("/api/portal-ui/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: kind === "Redemption" ? "redemption" : "subscription",
          cell: cls.cell,
          share_class: cls.cls,
          amount: amt,
        }),
      })
        .then((r) => r.json().then((j) => ({ ok: r.ok, j })))
        .then(({ ok, j }) => {
          if (!ok || !j.order) { setError((j && j.error) || "The order could not be placed."); return; }
          setOrders((xs) => [j.order].concat(xs));
          setPlaced(true);
        })
        .catch(() => setError("The order could not be placed."));
    };
    const stateTone = { "AWAITING NAV": "", "UNDER REVIEW": "", "FUNDS RECEIVED": "ok", "APPROVED": "ok" };
    return (
      <section>
        <ScreenHead title="Subscriptions & Redemptions" sub={tab}></ScreenHead>
        {tab === "Pending Orders" ? (
          <React.Fragment>
            <div className="pt-tbl">
              <div className="pt-th" style={{ gridTemplateColumns: "110px 1fr 80px 180px 150px 170px" }}>
                <span>Ref</span><span>Type</span><span>Class</span>
                <span style={{ textAlign: "right" }}>Amount</span><span>Placed</span><span style={{ textAlign: "right" }}>Status</span>
              </div>
              {orders.map((o) => (
                <div key={o.ref} className="pt-tr" style={{ gridTemplateColumns: "110px 1fr 80px 180px 150px 170px" }}>
                  <span className="tnum" style={{ fontWeight: 600 }}>{o.ref}</span>
                  <span>{o.kind}</span>
                  <span className="dim">Class {o.cls}</span>
                  <span className={"num tnum" + (o.amount.v < 0 ? " out" : "")}>{fmtAmt(o.amount)}</span>
                  <span className="dim tnum">{o.placed}</span>
                  <span style={{ textAlign: "right" }}><Caps tone={stateTone[o.state]}>{o.state}</Caps></span>
                </div>
              ))}
            </div>
            <div className="pt-form">
              <div className="pt-f"><label>NEW ORDER</label>
                <select value={kind} onChange={(e) => { setKind(e.target.value); setPlaced(false); setError(null); }}>
                  <option>Subscription</option><option>Redemption</option>
                </select>
              </div>
              <div className="pt-f"><label>CLASS</label>
                <select value={clsIdx} onChange={(e) => { setClsIdx(Number(e.target.value)); setPlaced(false); setError(null); }}>
                  {classes.map((c, i) => <option key={i} value={i}>{c.cls}</option>)}
                </select>
              </div>
              <div className="pt-f"><label>{amountLabel}</label>
                <input type="text" placeholder={amountPh} value={amount}
                  onChange={(e) => { setAmount(e.target.value); setPlaced(false); }} />
              </div>
              <button className={"pt-btn" + (placed ? " ok" : "")} onClick={placeOrder}>
                {placed ? "✓ Order placed" : "Place order"}
              </button>
              <div className="pt-note" style={{ flexBasis: "100%", marginTop: "6px" }}>
                Orders are executed at the next weekly NAV strike. Redemptions follow the quarterly liquidity policy.
              </div>
              {error ? (
                <div className="pt-note" style={{ flexBasis: "100%", marginTop: "0", color: "#9C4A33" }}>{error}</div>
              ) : null}
            </div>
          </React.Fragment>
        ) : null}
        {tab === "Settled History" ? (
          <div className="pt-tbl">
            <div className="pt-th" style={{ gridTemplateColumns: "110px 1fr 80px 180px 150px 130px" }}>
              <span>Ref</span><span>Type</span><span>Class</span>
              <span style={{ textAlign: "right" }}>Amount</span><span>Settled</span><span style={{ textAlign: "right" }}>NAV/unit</span>
            </div>
            {P.ORDERS_SETTLED.map((o) => (
              <div key={o.ref} className="pt-tr" style={{ gridTemplateColumns: "110px 1fr 80px 180px 150px 130px" }}>
                <span className="tnum" style={{ fontWeight: 600 }}>{o.ref}</span>
                <span>{o.kind}</span>
                <span className="dim">Class {o.cls}</span>
                <span className={"num tnum" + (o.amount.v < 0 ? " out" : "")}>{fmtAmt(o.amount)}</span>
                <span className="dim tnum">{o.settled}</span>
                <span className="num tnum dim">{o.unitStr}</span>
              </div>
            ))}
          </div>
        ) : null}
        {tab === "Distributions" ? (
          // Real v_portal_distributions rows from the bridge. Each amount is
          // {v, unit} in the class's OWN denomination (amount_usd xor
          // amount_near, never converted; the page toggle plays no part).
          // Status: DECLARED stays muted caps, PAID renders sage.
          <div className="pt-tbl">
            {P.DISTRIBUTIONS.length === 0 ? (
              <div className="pt-note">No distributions have been declared yet.</div>
            ) : (
              <React.Fragment>
                <div className="pt-th" style={{ gridTemplateColumns: "130px 130px 130px 1fr 180px 120px" }}>
                  <span>Ref</span><span>Record date</span><span>Pay date</span><span>Description</span>
                  <span style={{ textAlign: "right" }}>Amount</span><span style={{ textAlign: "right" }}>Status</span>
                </div>
                {P.DISTRIBUTIONS.map((d) => (
                  <div key={d.ref} className="pt-tr" style={{ gridTemplateColumns: "130px 130px 130px 1fr 180px 120px" }}>
                    <span className="tnum" style={{ fontWeight: 600 }}>{d.ref}</span>
                    <span className="dim tnum">{d.recordDate}</span>
                    <span className="dim tnum">{d.payDate}</span>
                    <span>{d.desc}</span>
                    <span className="num tnum" style={{ fontWeight: 600 }}>{fmtAmt(d.amount)}</span>
                    <span style={{ textAlign: "right" }}><Caps tone={d.status === "PAID" ? "ok" : ""}>{d.status}</Caps></span>
                  </div>
                ))}
              </React.Fragment>
            )}
          </div>
        ) : null}
      </section>
    );
  }

  /* ---------- On-chain Transparency ---------- */
  function ChainScreen({ denom, sub }) {
    const tab = sub || "Wallet Registry";
    const nearStr = (n) => P.group(String(n)) + " NEAR";
    return (
      <section>
        <ScreenHead title="On-chain Transparency" sub={tab}></ScreenHead>
        {tab === "Wallet Registry" ? (
          <div className="pt-tbl">
            <div className="pt-th" style={{ gridTemplateColumns: "1fr 1.2fr 160px" }}>
              <span>Purpose</span><span>Address</span><span style={{ textAlign: "right" }}>Type</span>
            </div>
            {P.WALLETS.map((w, i) => (
              <div key={i} className="pt-tr" style={{ gridTemplateColumns: "1fr 1.2fr 160px" }}>
                <span>{w.label}</span>
                <span className="mono">{w.addr}</span>
                <span style={{ textAlign: "right" }}><Caps>{w.kind}</Caps></span>
              </div>
            ))}
          </div>
        ) : null}
        {tab === "Staking Positions" ? (
          <div className="pt-tbl">
            <div className="pt-th" style={{ gridTemplateColumns: "1.4fr 200px 110px" }}>
              <span>Validator pool</span><span style={{ textAlign: "right" }}>Staked</span><span style={{ textAlign: "right" }}>APY</span>
            </div>
            {P.CHAIN_STAKING.map((s, i) => (
              <div key={i} className="pt-tr" style={{ gridTemplateColumns: "1.4fr 200px 110px" }}>
                <span className="mono">{s.pool}</span>
                <span className="num tnum">{nearStr(s.staked)}</span>
                <span className="num tnum dim">{s.apy}</span>
              </div>
            ))}
          </div>
        ) : null}
        {tab === "Venue Balances" ? (
          <div className="pt-tbl">
            <div className="pt-th" style={{ gridTemplateColumns: "1fr 220px 200px" }}>
              <span>Venue</span><span style={{ textAlign: "right" }}>NEAR balance</span><span style={{ textAlign: "right" }}>Verified</span>
            </div>
            {P.CHAIN_VENUES.map((v, i) => (
              <div key={i} className="pt-tr" style={{ gridTemplateColumns: "1fr 220px 200px" }}>
                <span>{v.name}</span>
                <span className="num tnum">{nearStr(v.near)}</span>
                <span className="num tnum dim">{v.verified}</span>
              </div>
            ))}
          </div>
        ) : null}
        {tab === "Proof of Reserves" ? (
          <div className="pt-tbl">
            <div className="pt-th" style={{ gridTemplateColumns: "150px 1fr 220px 160px" }}>
              <span>Date</span><span>Scope</span><span style={{ textAlign: "right" }}>Total verified</span><span style={{ textAlign: "right" }}>Result</span>
            </div>
            {P.POR.map((r, i) => (
              <div key={i} className="pt-tr" style={{ gridTemplateColumns: "150px 1fr 220px 160px" }}>
                <span className="dim tnum">{r.date}</span>
                <span className="dim">{r.scope}</span>
                <span className="num tnum">{nearStr(r.total)}</span>
                <span style={{ textAlign: "right" }}><Caps tone="ok">✓ {r.result}</Caps></span>
              </div>
            ))}
          </div>
        ) : null}
      </section>
    );
  }

  /* ---------- Statements ---------- */
  function StatementsScreen({ sub }) {
    const tab = sub || "Monthly Statements";
    const key = tab === "Confirmations" ? "confirmations" : tab === "Tax Reports" ? "tax" : "statements";
    const [downloaded, setDownloaded] = useState({});
    // Real v_portal_documents rows; downloads go through the existing
    // ownership-checked /documents/[id]/download route.
    const docs = P.DOCS[key];
    return (
      <section>
        <ScreenHead title="Statements" sub={tab}></ScreenHead>
        <div className="pt-tbl">
          {docs.length === 0 ? (
            <div className="pt-note">Nothing here yet — {tab.toLowerCase()} appear as they are issued.</div>
          ) : null}
          {docs.map((d, i) => (
            <div key={i} className="pt-tr" style={{ gridTemplateColumns: "44px 1fr 150px 100px 140px", display: "grid", height: "60px" }}>
              <span className="pt-file"><IcoFile size={16}></IcoFile></span>
              <span style={{ fontWeight: 500 }}>{d.name}</span>
              <span className="dim tnum">{d.date}</span>
              <span className="dim tnum">{d.size}</span>
              <span style={{ textAlign: "right" }}>
                <button className="pt-quiet" onClick={() => {
                  setDownloaded((x) => ({ ...x, [i]: true }));
                  if (d.url) window.open(d.url, "_blank");
                }}>
                  {downloaded[i] ? "✓ Downloaded" : "Download PDF"}
                </button>
              </span>
            </div>
          ))}
        </div>
      </section>
    );
  }

  Object.assign(window, { NavScreen, PositionsScreen, SubsScreen, ChainScreen, StatementsScreen });
})();
