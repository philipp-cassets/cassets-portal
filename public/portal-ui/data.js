/* cNEAR Investor Portal — live data loader.
   Replaces the prototype's mock portal/data.js with a same-shape loader that
   fetches /api/portal-ui/data (session-validated, investor-scoped). The fetch
   is synchronous on purpose: the Babel-compiled components read PortalData at
   module scope, so the global must exist before they evaluate.

   Denomination rule (house rule, replaces the prototype's RATE conversion):
   USD and NEAR are NEVER converted into each other. Every figure arrives from
   the server in its own real denomination; dual figures are
   {USD:{v,unit}, NEAR:{v,unit}} where a figure that genuinely exists in only
   one denomination carries that same value+unit under BOTH keys, so the other
   mode shows it unchanged with its own suffix. The RATE constant is gone. */

(function () {
  var payload = null;
  try {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/api/portal-ui/data", false); // sync: see header comment
    xhr.send(null);
    if (xhr.status === 401) { window.location.href = "/handler/sign-in"; return; }
    if (xhr.status === 403) { window.location.href = "/"; return; }
    if (xhr.status !== 200) throw new Error("portal data HTTP " + xhr.status);
    payload = JSON.parse(xhr.responseText);
  } catch (e) {
    console.error("Portal data load failed:", e);
    document.body.innerHTML =
      '<div style="font:15px \'Inter Tight\',system-ui,sans-serif;padding:48px;color:#05050C">' +
      "The portal could not load its data. Please refresh, or sign in again.</div>";
    return;
  }

  function group(intStr) {
    return intStr.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  // Resolve a figure to {v, unit} for the requested denomination.
  // Dual figures carry both keys (server-guaranteed); plain numbers are
  // treated as already denominated in the requested denomination.
  function sel(value, denom) {
    if (value == null) return { v: 0, unit: denom };
    if (typeof value === "number") return { v: value, unit: denom };
    if (value.USD || value.NEAR) {
      var s = value[denom] || value[denom === "USD" ? "NEAR" : "USD"];
      return { v: Number(s.v), unit: s.unit };
    }
    if ("v" in value) return { v: Number(value.v), unit: value.unit || denom };
    return { v: 0, unit: denom };
  }

  // Structural parts so the view can ghost the decimals and attach the NEAR
  // suffix without ever prefixing NEAR with "$".
  function parts(value, denom) {
    var s = sel(value, denom);
    var fixed = Math.abs(s.v).toFixed(2);
    var sp = fixed.split(".");
    var sign = s.v < 0 ? "-" : "";
    if (s.unit === "NEAR") {
      return { prefix: sign, int: group(sp[0]), dec: "." + sp[1], suffix: " NEAR" };
    }
    return { prefix: sign + "$ ", int: group(sp[0]), dec: "." + sp[1], suffix: "" };
  }

  // Compact inline string (pills / sublines) — no ghost decimals.
  function compact(value, denom) {
    var s = sel(value, denom);
    var sign = s.v < 0 ? "-" : "";
    var r = group(Math.round(Math.abs(s.v)).toString());
    return s.unit === "NEAR" ? sign + r + " NEAR" : sign + "$ " + r;
  }

  // Full inline string with 2 decimals (sublines that show cents).
  function full(value, denom) {
    var s = sel(value, denom);
    var sign = s.v < 0 ? "-" : "";
    var fixed = Math.abs(s.v).toFixed(2);
    var sp = fixed.split(".");
    var body = group(sp[0]) + "." + sp[1];
    return s.unit === "NEAR" ? sign + body + " NEAR" : sign + "$ " + body;
  }

  // Revive barcode NAV series dates (server sends YYYY-MM-DD strings).
  var NAV_POINTS = {};
  ["USD", "NEAR"].forEach(function (k) {
    var src = (payload.navSeries && payload.navSeries[k]) || { unit: k, points: [] };
    NAV_POINTS[k] = {
      unit: src.unit,
      points: (src.points || []).map(function (p) {
        return { date: new Date(p.date + "T00:00:00"), nav: Number(p.nav) };
      }),
    };
  });

  // Notifications are REAL (cassets.portal_notifications via the bridge):
  // read-state arrives server-persisted per auth user; the old localStorage
  // merge is gone. Mark-read POSTs are fire-and-forget — the dropdown updates
  // optimistically exactly as the prototype behaved.
  var NOTIFS = (payload.notifs || []).map(function (n) {
    return { id: n.id, kind: n.kind, t: n.t, d: n.d, read: !!n.read };
  });
  function post(url, body) {
    try {
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body || {}),
      }).catch(function () { /* fire-and-forget */ });
    } catch (e) { /* noop */ }
  }
  function markNotifRead(id) {
    post("/api/portal-ui/notifications/read", { id: id });
  }
  function markAllNotifsRead() {
    post("/api/portal-ui/notifications/read-all");
  }

  window.PortalData = {
    parts: parts,
    compact: compact,
    full: full,
    group: group,
    FIGURES: payload.figures,
    SEGMENTS: payload.segments,
    LEDGER: payload.ledger,
    NAV_POINTS: NAV_POINTS,
    NAV_TABLE: payload.navTable,
    ORDERS_PENDING: payload.ordersPending || [],
    ORDERS_SETTLED: payload.ordersSettled || [],
    ORDER_CLASSES: payload.orderClasses || [],
    DISTRIBUTIONS: payload.distributions || [],
    WALLETS: payload.wallets || [],
    CHAIN_STAKING: payload.chainStaking || [],
    CHAIN_VENUES: payload.chainVenues || [],
    POR: payload.por || [],
    DOCS: payload.docs || { statements: [], confirmations: [], tax: [] },
    NOTIFS: NOTIFS,
    markNotifRead: markNotifRead,
    markAllNotifsRead: markAllNotifsRead,
    PERIODS: payload.periods || ["—"],
    PERIOD_TF: payload.periodTf || {},
    INVESTOR: payload.investor,
    HEADER: payload.header,
    // Returned by the bridge for completeness (raw rows behind the mapped
    // surfaces above; see MOCK-FED INVENTORY).
    DOCUMENTS: payload.documents,
    NEWS: payload.news,
    REDEMPTION_REQUESTS: payload.redemptionRequests,
  };
})();
