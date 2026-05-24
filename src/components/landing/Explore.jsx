const services = [
  {
    tag: "Promo",
    title: "Diskon 20% Member",
    text: "Mulai latihan dengan paket hemat untuk member baru.",
  },
  {
    tag: "Promo",
    title: "PT Session Bundle",
    text: "Paket private trainer untuk latihan lebih terarah.",
  },
  {
    tag: "Event",
    title: "Workout Ladies Party",
    text: "Kelas komunitas untuk membangun ritme olahraga bersama.",
  },
  {
    tag: "Tips",
    title: "Improve Your Squats",
    text: "Panduan singkat menjaga teknik dan posisi latihan.",
  },
  {
    tag: "Tips",
    title: "Eat For Muscle Fuel",
    text: "Pilih asupan tepat untuk mendukung progres latihan.",
  },
  {
    tag: "Promo",
    title: "Trainer Schedule Online",
    text: "Cek jadwal trainer dan pilih sesi latihan favorit.",
  },
];

export default function Explore() {
  return (
    <section className="landing-section landing-explore" id="explore">
      <div className="explore-heading">
        <p>"Stay updated with promotions, events, and fitness tips."</p>
        <div className="explore-tabs">
          <button>All</button>
          <button>Promo</button>
          <button>Event</button>
          <button>Tips</button>
        </div>
      </div>
      <div className="explore-grid">
        {services.map((item) => (
          <article className="explore-card" key={item.title}>
            <span>{item.tag}</span>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
            <a href="#facilities">Read More</a>
          </article>
        ))}
      </div>
    </section>
  );
}
