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
      <SectionHead num="04" title="News" />

      {posts.length === 0 ? (
        <div className="empty-state">
          Nothing to report. When there is news, it will be posted here,
          without fanfare.
        </div>
      ) : (
        posts.map((post) => (
          <article key={post.id} className="news-post">
            <div className="meta">
              <span>{fmtDateTime(post.published_at)}</span>
              {post.cell && <span>{post.cell}</span>}
            </div>
            <h2>{post.title}</h2>
            <div className="news-body">{renderMarkdown(post.body_md)}</div>
          </article>
        ))
      )}
    </section>
  );
}
