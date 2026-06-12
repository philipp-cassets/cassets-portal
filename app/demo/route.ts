import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Public demonstration portal: the exact investor-portal prototype rendered
// on FICTITIOUS fixture data (the "Pemberton" book). No session, no database
// reads (the data endpoint runs fixture-only under demoContext), and a fixed
// banner declares the fiction. Exists so prospects can see the product before
// Neon Auth go-live and after it, for marketing.
export async function GET(request: Request) {
  const embed = new URL(request.url).searchParams.get("embed") === "1";
  let html = await fs.readFile(
    path.join(process.cwd(), "app", "portal", "index.html"),
    "utf8"
  );
  // The prototype's tag is <body class="entering">; match any attributes and
  // fail LOUDLY if the anchor ever disappears (a silent no-op here ships a
  // broken demo, which happened once).
  if (!/<body[^>]*>/.test(html)) {
    throw new Error("demo injection anchor <body> not found in portal index.html");
  }
  const embedStyle = embed
    ? `<style>html{zoom:0.40}body{overflow-x:hidden;scrollbar-width:none}` +
      `body::-webkit-scrollbar{display:none}` +
      `*{animation-duration:0.01s!important;animation-delay:0s!important}</style>`
    : "";
  const banner = embed
    ? ""
    : `<div style="position:fixed;bottom:14px;left:50%;transform:translateX(-50%);` +
      `z-index:9999;background:#1E1C18;color:rgba(255,255,255,0.92);font:600 11px/1 ` +
      `'Inter Tight',system-ui,sans-serif;letter-spacing:0.12em;text-transform:uppercase;` +
      `padding:9px 16px;border-radius:9999px;pointer-events:none;">` +
      `Demonstration &middot; fictitious data</div>`;
  html = html.replace(
    /<body([^>]*)>/,
    `<body$1>${embedStyle}<script>window.__PORTAL_DATA_URL="/api/portal-ui/data?demo=1";</script>${banner}`
  );
  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
