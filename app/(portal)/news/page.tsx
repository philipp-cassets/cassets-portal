import { requirePortalSession } from "@/lib/auth";
import { getNews, getPositions } from "@/lib/data";
import { PendingActivation } from "@/components/PendingActivation";
import { SectionHead } from "@/components/SectionHead";
import { renderMarkdown } from "@/lib/markdown";
import { fmtDateTime } from "@/lib/format";

export default async function NewsPage() {
  const session = await requirePortalSession();

  if (!session.investorId) {
    return <PendingActivation displayName={session.displayName} />;
  }

  // Platform-wide posts plus posts for cells this investor holds.
  const positions = await getPositions(session.investorId);
  const cells = [...new Set(positions.map((p) => p.cell))];
  const posts = await getNews(cells);

  return (
    <section className="page-section">
      <div className="fade-1">
        <SectionHead title="News &amp; Reports" />
      </div>

      {posts.length === 0 ? (
        <div className="empty-state fade-2">
          Nothing to report. When there is news, it will be posted here,
          without fanfare.
        </div>
      ) : (
        posts.map((post) => (
          <article key={post.id} className="news-post fade-2">
            <div className="meta">
              <span>{fmtDateTime(post.published_at)}</span>
              {post.cell && <span className="pill pill-xs">{post.cell}</span>}
            </div>
            <h2>{post.title}</h2>
            <div className="news-body">{renderMarkdown(post.body_md)}</div>
          </article>
        ))
      )}
    </section>
  );
}
