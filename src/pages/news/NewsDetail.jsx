import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import api from "@/components/auth/hooks/authApi";
import vocafitLogo from "../../assets/auth/vocafit-logo.png";
import gymImage from "../../assets/auth/signup-gym.jpg";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:8080/api").replace(/\/api\/?$/, "");

const resolveImageUrl = (value) => {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `${API_ORIGIN}${value.startsWith("/") ? value : `/${value}`}`;
};

const getPayload = (response) => response?.data?.data || response?.data || {};

const getErrorMessage = (err, fallback) =>
  err.response?.data?.error || err.response?.data?.message || err.message || fallback;

const formatDate = (value) => {
  if (!value) return "Vocafit News";
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const fallbackSuggestions = [
  {
    id: "pt-session-bundle",
    tag: "Promo",
    title: "PT Sessions Bundle",
    text: "Buy 10 Personal Trainer sessions and get 2 extra sessions free plus exclusive merchandise.",
  },
  {
    id: "weekend-zumba",
    tag: "Event",
    title: "Weekend Zumba Party!",
    text: "Burn calories with our guest instructor, free for all active members.",
  },
  {
    id: "deadlift-posture",
    tag: "Tips",
    title: "Improve your Deadlift Posture",
    text: "Avoid back injuries with a step by step safety guide.",
  },
];

const normalizeSuggestion = (item) => ({
  id: item.id || item.news_id || item.title,
  tag: item.category || item.type || "News",
  title: item.title || "Untitled News",
  text: item.summary || item.content || item.description || "",
});

export default function NewsDetail() {
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchNewsDetail = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get(`/news/${id}`);
        if (isMounted) setNews(getPayload(response));
      } catch (err) {
        if (isMounted) setError(getErrorMessage(err, "Gagal memuat detail news."));
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchNewsDetail();
    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    let isMounted = true;

    const fetchSuggestions = async () => {
      try {
        const response = await api.get("/news");
        const rawNews = response.data?.data || response.data || [];
        if (!Array.isArray(rawNews)) return;

        const nextSuggestions = rawNews
          .filter((item) => String(item.id || item.news_id || item.title) !== String(id))
          .slice(0, 3)
          .map(normalizeSuggestion);

        if (isMounted) setSuggestions(nextSuggestions);
      } catch {
        if (isMounted) setSuggestions([]);
      }
    };

    fetchSuggestions();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const detail = useMemo(() => {
    if (!news) return null;
    return {
      title: news.title || "Untitled News",
      summary: news.summary || news.description || "",
      content: news.content || news.description || news.summary || "",
      imageUrl: resolveImageUrl(news.image_url || news.imageUrl || news.image || ""),
      author: news.author || news.author_name || "Vocafit Team",
      date: formatDate(news.created_at || news.createdAt),
      tag: news.category || news.type || "Promo",
    };
  }, [news]);

  const relatedItems = suggestions.length > 0 ? suggestions : fallbackSuggestions;
  const paragraphs = detail?.content.split(/\n+/).filter(Boolean) || [];
  const introParagraphs = paragraphs.length > 0 ? paragraphs : [
    detail?.summary || "Vocafit is offering a special promotion for members this month. New members can enjoy exclusive programs and facilities designed to support consistent training.",
  ];

  return (
    <main className="news-detail-page">
      <style>{newsDetailStyles}</style>
      <header className="news-detail-nav">
        <Link className="news-detail-brand" to="/">
          <img src={vocafitLogo} alt="Vocafit" />
          <span>Vocafit</span>
        </Link>
        <nav className="news-detail-links" aria-label="Navigasi utama">
          <Link to="/">Home</Link>
          <Link to="/explore">Discover</Link>
          <Link to="/#facilities">Facilities</Link>
          <Link to="/sign-in">Sign In</Link>
          <Link className="news-detail-join" to="/membership">Join Us</Link>
        </nav>
      </header>

      {loading ? (
        <section className="news-detail-state">Memuat detail news...</section>
      ) : error ? (
        <section className="news-detail-state is-error">
          <strong>{error}</strong>
          <Link to="/explore">Kembali ke Explore</Link>
        </section>
      ) : (
        <>
          <article className="news-detail-article">
            <nav className="news-detail-breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span>Discover</span>
              <span>Article Detail</span>
            </nav>
            <span className="news-detail-kicker">{detail.tag}</span>
            <h1>{detail.title}</h1>
            <div className="news-detail-meta">
              <span className="meta-calendar" aria-hidden="true" />
              <span>{detail.date}</span>
              <span className="meta-author" aria-hidden="true" />
              <span>{detail.author}</span>
              <span className="meta-clock" aria-hidden="true" />
              <span>3 min read</span>
            </div>
            <div className="news-detail-hero">
              <img src={detail.imageUrl || gymImage} alt="" />
            </div>
            <div className="news-detail-body">
              <h2>{detail.summary || "Start Your Fitness Journey with Special Savings"}</h2>
              {introParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              <div className="news-benefit-box">
                <strong>Members who register will receive:</strong>
                <ul>
                  <li>20% membership discount</li>
                  <li>Access to all gym facilities</li>
                  <li>Personalized workout recommendations</li>
                  <li>Progress tracking dashboard</li>
                  <li>Exclusive member events</li>
                </ul>
              </div>
            </div>
          </article>

          <section className="news-related">
            <div className="news-related-inner">
              <span>Keep Reading</span>
              <h2>You Might Also Like</h2>
              <div className="news-related-grid">
                {relatedItems.map((item) => (
                  <article className="news-related-card" key={item.id || item.title}>
                    <span className={`news-related-tag tag-${item.tag.toLowerCase()}`}>{item.tag}</span>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                    {item.id && !String(item.id).includes(" ") ? (
                      <Link to={`/news/${item.id}`}>Read More <span aria-hidden="true">-&gt;</span></Link>
                    ) : (
                      <Link to="/explore">Read More <span aria-hidden="true">-&gt;</span></Link>
                    )}
                  </article>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  );
}

const newsDetailStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Anton&family=DM+Sans:wght@400;500;600;700;800;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; }

  .news-detail-page {
    min-height: 100vh;
    background: #eef1f7;
    color: #0a1185;
    font-family: 'DM Sans', sans-serif;
  }

  .news-detail-nav {
    align-items: center;
    background: #15165d;
    display: flex;
    justify-content: space-between;
    min-height: 60px;
    padding: 0 clamp(24px, 7vw, 98px);
  }

  .news-detail-brand {
    align-items: center;
    color: #ff7a00;
    display: inline-flex;
    font-size: 24px;
    font-weight: 900;
    gap: 10px;
    text-decoration: none;
  }

  .news-detail-brand img {
    height: 44px;
    width: 44px;
  }

  .news-detail-links {
    align-items: center;
    display: flex;
    gap: clamp(18px, 3vw, 42px);
  }

  .news-detail-links a {
    color: #fff;
    font-size: 14px;
    font-weight: 900;
    text-decoration: none;
  }

  .news-detail-links a:hover {
    color: #ff8a00;
  }

  .news-detail-links .news-detail-join {
    background: #ff7a00;
    border-radius: 999px;
    color: #fff;
    min-width: 84px;
    padding: 11px 18px;
    text-align: center;
  }

  .news-detail-article {
    margin: 0 auto 34px;
    max-width: 800px;
    padding: 18px 28px 0;
  }

  .news-detail-breadcrumb {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 40px;
  }

  .news-detail-breadcrumb a,
  .news-detail-breadcrumb span {
    color: #15165d;
    font-size: 11px;
    font-weight: 900;
    text-decoration: none;
  }

  .news-detail-breadcrumb span::before {
    color: #a7abc3;
    content: '>';
    margin-right: 8px;
  }

  .news-detail-hero {
    aspect-ratio: 1.55 / 1;
    background: #d7d9e7;
    border-radius: 8px;
    margin-top: 14px;
    overflow: hidden;
    width: 100%;
  }

  .news-detail-hero img {
    display: block;
    height: 100%;
    object-fit: cover;
    width: 100%;
  }

  .news-detail-kicker {
    background: #ffd1af;
    border: 1px solid #ff9b57;
    border-radius: 999px;
    color: #ff7a00;
    display: inline-flex;
    font-size: 11px;
    font-weight: 900;
    margin-bottom: 8px;
    padding: 5px 18px;
  }

  .news-detail-article h1 {
    color: #0a1185;
    font-size: 34px;
    font-weight: 900;
    letter-spacing: 0;
    line-height: 1.08;
    margin: 0 0 8px;
    max-width: 620px;
  }

  .news-detail-meta {
    align-items: center;
    color: #797f9d;
    display: inline-flex;
    flex-wrap: wrap;
    gap: 7px;
    font-size: 12px;
    font-weight: 800;
  }

  .meta-calendar,
  .meta-author,
  .meta-clock {
    border: 2px solid currentColor;
    display: inline-block;
    height: 12px;
    position: relative;
    width: 12px;
  }

  .meta-calendar {
    border-radius: 2px;
    color: #ff7a00;
  }

  .meta-author {
    border-radius: 50%;
    color: #ff7a00;
    margin-left: 8px;
  }

  .meta-clock {
    border-radius: 50%;
    color: #ff7a00;
    margin-left: 8px;
  }

  .meta-clock::after {
    background: currentColor;
    content: '';
    height: 4px;
    left: 5px;
    position: absolute;
    top: 2px;
    width: 2px;
  }

  .news-detail-body {
    display: grid;
    gap: 13px;
    padding: 18px 0 0;
  }

  .news-detail-body h2 {
    color: #0a1185;
    font-size: 17px;
    font-weight: 900;
    line-height: 1.3;
    margin: 0;
  }

  .news-detail-body p {
    color: #24305f;
    font-size: 13px;
    font-weight: 600;
    line-height: 1.55;
    margin: 0;
  }

  .news-benefit-box {
    background: #eceeff;
    border: 1px solid #c5c9ea;
    border-radius: 8px;
    color: #0a1185;
    margin-top: 6px;
    padding: 16px 20px;
  }

  .news-benefit-box strong {
    display: block;
    font-size: 13px;
    font-weight: 900;
    margin-bottom: 10px;
  }

  .news-benefit-box ul {
    display: grid;
    gap: 7px;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .news-benefit-box li {
    color: #0a1185;
    font-size: 12px;
    font-weight: 800;
    line-height: 1.35;
    padding-left: 20px;
    position: relative;
  }

  .news-benefit-box li::before {
    align-items: center;
    border: 2px solid #ff7a00;
    border-radius: 50%;
    color: #ff7a00;
    content: '+';
    display: inline-flex;
    font-size: 8px;
    font-weight: 900;
    height: 11px;
    justify-content: center;
    left: 0;
    position: absolute;
    top: 2px;
    width: 11px;
  }

  .news-related {
    background: #02005c;
    padding: 28px 28px 36px;
  }

  .news-related-inner {
    margin: 0 auto;
    max-width: 800px;
  }

  .news-related-inner > span {
    color: #ff7a00;
    display: block;
    font-size: 13px;
    font-weight: 900;
    letter-spacing: .16em;
    margin-bottom: 4px;
    text-transform: uppercase;
  }

  .news-related h2 {
    color: #fff;
    font-size: 24px;
    font-weight: 900;
    line-height: 1.1;
    margin: 0 0 24px;
  }

  .news-related-grid {
    display: grid;
    gap: 18px;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .news-related-card {
    background: #d9d9d9;
    border-radius: 8px;
    color: #202020;
    display: flex;
    flex-direction: column;
    min-height: 142px;
    padding: 18px;
  }

  .news-related-tag {
    align-self: flex-start;
    background: #ffd1af;
    border: 1px solid #ff9b57;
    border-radius: 999px;
    color: #ff7a00;
    font-size: 10px;
    font-weight: 900;
    margin-bottom: 12px;
    padding: 5px 13px;
  }

  .news-related-tag.tag-event {
    background: #c7d5ff;
    border-color: #8aa6f2;
    color: #516dcc;
  }

  .news-related-tag.tag-tips {
    background: #bed8bb;
    border-color: #83ab7f;
    color: #477241;
  }

  .news-related-card h3 {
    color: #f06f16;
    font-size: 12px;
    font-weight: 900;
    line-height: 1.25;
    margin: 0 0 5px;
  }

  .news-related-card p {
    color: #383838;
    flex: 1;
    font-size: 10px;
    font-weight: 700;
    line-height: 1.35;
    margin: 0 0 12px;
  }

  .news-related-card a {
    align-items: center;
    color: #0a1185;
    display: flex;
    font-size: 11px;
    font-weight: 900;
    justify-content: space-between;
    text-decoration: none;
  }

  .news-detail-state {
    align-items: center;
    color: #0a1185;
    display: grid;
    font-size: 15px;
    font-weight: 900;
    gap: 14px;
    justify-items: center;
    min-height: calc(100vh - 60px);
    padding: 30px;
    text-align: center;
  }

  .news-detail-state.is-error {
    color: #c73822;
  }

  .news-detail-state a {
    color: #ff6b20;
    text-decoration: none;
  }

  @media (max-width: 760px) {
    .news-detail-nav {
      align-items: flex-start;
      flex-direction: column;
      gap: 12px;
      padding-bottom: 14px;
      padding-top: 14px;
    }

    .news-detail-links {
      display: grid;
      gap: 9px;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      width: 100%;
    }

    .news-detail-links a {
      font-size: 12px;
      text-align: center;
    }

    .news-detail-links .news-detail-join {
      padding: 9px 12px;
    }

    .news-detail-article {
      padding: 16px 18px 0;
    }

    .news-detail-breadcrumb {
      margin-bottom: 26px;
    }

    .news-detail-hero {
      aspect-ratio: 1.22 / 1;
    }

    .news-detail-article h1 {
      font-size: 27px;
    }

    .news-detail-meta {
      font-size: 11px;
    }

    .news-related {
      padding-left: 18px;
      padding-right: 18px;
    }

    .news-related-grid {
      grid-template-columns: 1fr;
    }
  }
`;
