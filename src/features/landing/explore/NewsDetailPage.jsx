import { useParams, Link } from "react-router";
import useNewsDetail from "@/features/landing/explore/hooks/useNewsDetail";

export default function NewsDetail() {
  const { id } = useParams();
  const { news, loading, error } = useNewsDetail(id);

  if (loading) return <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-white">Loading...</div>;
  if (error) return <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-red-500">{error}</div>;
  if (!news) return null;

  return (
    <div className="min-h-screen bg-neutral-900 text-white pb-20">
      <div className="max-w-4xl mx-auto px-4 pt-10">
        <Link to="/explore" className="text-neutral-400 hover:text-white mb-8 inline-block transition-colors">
          ← Back to Explore
        </Link>
        
        <img 
          src={news.imageUrl} 
          alt={news.title}
          className="w-full h-[400px] object-cover rounded-2xl mb-10 shadow-2xl border border-neutral-800"
        />

        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <span className="bg-brand-500/10 text-brand-500 px-3 py-1 rounded-full text-sm font-semibold uppercase tracking-wider">
              {news.category || "General"}
            </span>
            <span className="text-neutral-500 text-sm">
              {new Date(news.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black leading-tight text-white italic">
            {news.title}
          </h1>

          <div className="prose prose-invert max-w-none text-neutral-300 text-lg leading-relaxed space-y-4">
            {news.content?.split('\n').map((para, i) => (
              para ? <p key={i}>{para}</p> : <br key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
