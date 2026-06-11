import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import api from "../../components/auth/hooks/authApi";
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
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
};

export default function NewsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
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

  const detail = useMemo(() => {
    if (!news) return null;
    return {
      title: news.title || "Untitled News",
      summary: news.summary || news.description || "",
      content: news.content || news.description || news.summary || "",
      imageUrl: resolveImageUrl(news.image_url || news.imageUrl || news.image || ""),
      author: news.author || news.author_name || "Vocafit Team",
      date: formatDate(news.created_at || news.createdAt),
    };
  }, [news]);

  return (
    <main className="news-detail-page">
      <style>{newsDetailStyles}</style>
      <header className="news-detail-nav">
        <Link className="news-detail-brand" to="/">
          <img src={vocafitLogo} alt="Vocafit" />
          <span>Vocafit</span>
        </Link>
        <button className="news-detail-back" type="button" onClick={() => navigate(-1)}>
          Back
        </button>
      </header>

      {loading ? (
        <section className="news-detail-state">Memuat detail news...</section>
      ) : error ? (
        <section className="news-detail-state is-error">
          <strong>{error}</strong>
          <Link to="/explore">Kembali ke Explore</Link>
        </section>
      ) : (
        <article className="news-detail-article">
          <div className="news-detail-hero">
            <img src={detail.imageUrl || gymImage} alt="" />
          </div>
          <div className="news-detail-content">
            <span className="news-detail-kicker">News</span>
            <h1>{detail.title}</h1>
            <div className="news-detail-meta">
              <span>{detail.author}</span>
              <span>{detail.date}</span>
            </div>
            {detail.summary && <p className="news-detail-summary">{detail.summary}</p>}
            <div className="news-detail-body">
              {detail.content.split(/\n+/).filter(Boolean).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </article>
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
    background: #f1f2f5;
    color: #0a1185;
    font-family: 'DM Sans', sans-serif;
  }

  .news-detail-nav {
    align-items: center;
    background: #080478;
    display: flex;
    justify-content: space-between;
    min-height: 76px;
    padding: 0 34px;
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

  .news-detail-back {
    background: #ff7a00;
    border: 0;
    border-radius: 8px;
    color: #fff;
    cursor: pointer;
    font: inherit;
    font-size: 13px;
    font-weight: 900;
    min-height: 38px;
    padding: 0 18px;
  }

  .news-detail-article {
    margin: 0 auto;
    max-width: 1040px;
    padding: 34px 28px 54px;
  }

  .news-detail-hero {
    aspect-ratio: 16 / 7;
    background: #d7d9e7;
    border-radius: 8px;
    overflow: hidden;
    width: 100%;
  }

  .news-detail-hero img {
    display: block;
    height: 100%;
    object-fit: cover;
    width: 100%;
  }

  .news-detail-content {
    background: #fff;
    border-radius: 8px;
    margin: -46px auto 0;
    max-width: 840px;
    padding: 30px 34px 36px;
    position: relative;
  }

  .news-detail-kicker {
    color: #ff6b20;
    font-size: 12px;
    font-weight: 900;
    text-transform: uppercase;
  }

  .news-detail-content h1 {
    color: #0a1185;
    font-family: 'Anton', sans-serif;
    font-size: 42px;
    font-weight: 400;
    letter-spacing: 0;
    line-height: 1.08;
    margin: 10px 0 12px;
  }

  .news-detail-meta {
    color: #66709d;
    display: flex;
    flex-wrap: wrap;
    gap: 8px 16px;
    font-size: 12px;
    font-weight: 800;
    margin-bottom: 24px;
  }

  .news-detail-summary {
    border-left: 4px solid #ff6b20;
    color: #384076;
    font-size: 16px;
    font-weight: 800;
    line-height: 1.55;
    margin: 0 0 24px;
    padding-left: 16px;
  }

  .news-detail-body {
    display: grid;
    gap: 16px;
  }

  .news-detail-body p {
    color: #24305f;
    font-size: 15px;
    font-weight: 600;
    line-height: 1.75;
    margin: 0;
  }

  .news-detail-state {
    align-items: center;
    color: #0a1185;
    display: grid;
    font-size: 15px;
    font-weight: 900;
    gap: 14px;
    justify-items: center;
    min-height: calc(100vh - 76px);
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

  @media (max-width: 720px) {
    .news-detail-nav {
      padding: 0 20px;
    }

    .news-detail-article {
      padding: 24px 18px 38px;
    }

    .news-detail-hero {
      aspect-ratio: 4 / 3;
    }

    .news-detail-content {
      margin-top: -24px;
      padding: 24px 20px 28px;
    }

    .news-detail-content h1 {
      font-size: 32px;
    }
  }
`;
