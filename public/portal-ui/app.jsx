/* App shell: denomination state + synchronized "re-print" flip */

(function () {
  const { useState, useCallback } = React;

  function App() {
    const [denom, setDenom] = useState("USD");
    const [reprinting, setReprinting] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [timeframe, setTimeframe] = useState("D");

    // Denomination flip: blur+fade all numerals over 150ms, swap values, settle 250ms.
    // Never an animated conversion between USD and NEAR.
    const flip = useCallback(() => {
      if (reprinting) return;
      setReprinting(true);
      setTimeout(() => setDenom((d) => (d === "USD" ? "NEAR" : "USD")), 150);
      setTimeout(() => setReprinting(false), 180);
    }, [reprinting]);

    const rp = reprinting ? " reprint" : "";

    return (
      <div className="shell">
        <Sidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed((c) => !c)}></Sidebar>

        <main className="canvas" data-screen-label="Main canvas">
          <div className="content">
            <Header denom={denom} onFlip={flip}></Header>
            <KpiBlock denom={denom} rp={rp} timeframe={timeframe} setTimeframe={setTimeframe}></KpiBlock>
            <PositionStrip denom={denom} rp={rp}></PositionStrip>
            <BarcodeChart denom={denom}></BarcodeChart>
            <ActivityLedger denom={denom} rp={rp}></ActivityLedger>
          </div>
        </main>

        <div className="stone"></div>
        <ScrollIndicator></ScrollIndicator>
      </div>
    );
  }

  ReactDOM.createRoot(document.getElementById("root")).render(<App></App>);
})();
