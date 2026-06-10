/* App shell: routing + denomination state + synchronized "re-print" flip */

(function () {
  const { useState, useEffect, useCallback } = React;

  const ROUTE_KEY = "cnear-portal-route";

  function loadRoute() {
    try {
      const r = JSON.parse(localStorage.getItem(ROUTE_KEY));
      if (r && r.screen) return r;
    } catch (e) { /* noop */ }
    return { screen: "dashboard" };
  }

  function Dashboard({ denom, rp, timeframe, setTimeframe }) {
    return (
      <React.Fragment>
        <KpiBlock denom={denom} rp={rp} timeframe={timeframe} setTimeframe={setTimeframe}></KpiBlock>
        <PositionStrip denom={denom} rp={rp}></PositionStrip>
        <BarcodeChart denom={denom} timeframe={timeframe}></BarcodeChart>
        <ActivityLedger denom={denom} rp={rp}></ActivityLedger>
      </React.Fragment>
    );
  }

  function App() {
    const [denom, setDenom] = useState("USD");
    const [reprinting, setReprinting] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [timeframe, setTimeframe] = useState("D");
    const [route, setRoute] = useState(loadRoute);
    const [period, setPeriod] = useState(PortalData.PERIODS[0]);

    useEffect(() => {
      try { localStorage.setItem(ROUTE_KEY, JSON.stringify(route)); } catch (e) { /* noop */ }
    }, [route]);

    const onNav = useCallback((r) => {
      setRoute(r);
      const canvas = document.querySelector(".canvas");
      if (canvas) canvas.scrollTop = 0;
    }, []);

    // Period preset selection re-labels the pill AND windows the real NAV
    // series where cheap: each preset maps to a §4 timeframe (bridge-fed).
    const onPeriod = useCallback((p) => {
      setPeriod(p);
      const tf = (PortalData.PERIOD_TF || {})[p];
      if (tf) setTimeframe(tf);
    }, []);

    // Denomination flip: blur+fade all numerals over 150ms, swap values, settle 250ms.
    // Never an animated conversion between USD and NEAR.
    const flip = useCallback(() => {
      if (reprinting) return;
      setReprinting(true);
      setTimeout(() => setDenom((d) => (d === "USD" ? "NEAR" : "USD")), 150);
      setTimeout(() => setReprinting(false), 180);
    }, [reprinting]);

    const rp = reprinting ? " reprint" : "";
    const s = route.screen;

    return (
      <div className="shell">
        <Sidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed((c) => !c)}
          route={route} onNav={onNav}></Sidebar>

        <main className="canvas" data-screen-label="Main canvas">
          <div className="content">
            <Header denom={denom} onFlip={flip} period={period} onPeriod={onPeriod}></Header>
            {s === "dashboard" ? <Dashboard denom={denom} rp={rp} timeframe={timeframe} setTimeframe={setTimeframe}></Dashboard> : null}
            {s === "nav" ? <NavScreen denom={denom}></NavScreen> : null}
            {s === "positions" ? <PositionsScreen denom={denom}></PositionsScreen> : null}
            {s === "subs" ? <SubsScreen denom={denom} sub={route.sub}></SubsScreen> : null}
            {s === "chain" ? <ChainScreen denom={denom} sub={route.sub}></ChainScreen> : null}
            {s === "statements" ? <StatementsScreen sub={route.sub}></StatementsScreen> : null}
          </div>
        </main>

        <div className="stone"></div>
        {s === "dashboard" ? <ScrollIndicator></ScrollIndicator> : null}
      </div>
    );
  }

  ReactDOM.createRoot(document.getElementById("root")).render(<App></App>);
})();
