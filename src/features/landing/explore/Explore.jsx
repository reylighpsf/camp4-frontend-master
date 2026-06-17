import { Link } from "react-router";
import useExploreNews from "@/features/landing/explore/hooks/useExploreNews";

const services = [
  {
    tag: "Promo",
    title: "Diskon 20% Member",
    text: "Mulai latihan dengan paket hemat untuk member baru.",
    imageUrl: "",
  },
  {
    tag: "Promo",
    title: "PT Session Bundle",
    text: "Paket private trainer untuk latihan lebih terarah.",
    imageUrl: "",
  },
  {
    tag: "Event",
    title: "Workout Ladies Party",
    text: "Kelas komunitas untuk membangun ritme olahraga bersama.",
    imageUrl: "",
  },
  {
    tag: "Tips",
    title: "Improve Your Squats",
    text: "Panduan singkat menjaga teknik dan posisi latihan.",
    imageUrl: "",
  },
  {
    tag: "Tips",
    title: "Eat For Muscle Fuel",
    text: "Pilih asupan tepat untuk mendukung progres latihan.",
    imageUrl: "",
  },
  {
    tag: "Promo",
    title: "Trainer Schedule Online",
    text: "Cek jadwal trainer dan pilih sesi latihan favorit.",
    imageUrl: "",
  },
];

export default function Explore() {
  const {
    news,
    filteredNews,
    filters,
    activeFilter,
    loading,
    error,
    setActiveFilter,
  } = useExploreNews();
  const fallbackNews = activeFilter === "All"
    ? services
    : services.filter((item) => item.tag === activeFilter);
  const visibleNews = news.length > 0 ? filteredNews : fallbackNews;
  const visibleFilters = filters.length > 1 ? filters : ["All", "Promo", "Event", "Tips"];

  return (
    <section className="landing-section landing-explore" id="explore">
      <div className="explore-heading">
        <p>"Stay updated with promotions, events, and fitness tips."</p>
        <div className="explore-tabs">
          {visibleFilters.map((filter) => (
            <button
              className={activeFilter === filter ? "is-active" : ""}
              key={filter}
              onClick={() => setActiveFilter(filter)}
              type="button"
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
      {loading && <p className="explore-status">Memuat news...</p>}
      {!loading && error && <p className="explore-status">{error}</p>}
      <div className="explore-grid">
        {visibleNews.map((item) => (
          <article className="explore-card" key={item.title}>
            {item.imageUrl && (
              <img className="explore-card-image" src={item.imageUrl} alt={item.title} />
            )}
            <div className="explore-card-body">
              <span>{item.tag}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              {item.fromApi ? (
                <Link to={`/news/${item.id}`}>Read More</Link>
              ) : (
                <a href="#facilities">Read More</a>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
