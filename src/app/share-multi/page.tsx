"use client";

import { useEffect, useState, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

const parseImages = (imageUrlString: string | null): string[] => {
  if (!imageUrlString) return [];
  try {
    if (imageUrlString.startsWith('[')) {
      return JSON.parse(imageUrlString);
    }
    return [imageUrlString];
  } catch {
    return [imageUrlString];
  }
};

function ShareMultiContent() {
  const searchParams = useSearchParams();
  const tokenString = searchParams.get('t');
  const tokens = tokenString ? tokenString.split(',') : [];
  
  const { width, height } = useWindowSize();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    async function fetchMemories() {
      if (tokens.length === 0) {
        setError("No memories to load. The link might be incomplete.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("content_items")
        .select("*")
        .in("share_token", tokens);

      if (error || !data || data.length === 0) {
        setError("These memories couldn't be found. They might have been deleted, or the link is incorrect.");
      } else {
        const sortedData = data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setItems(sortedData);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 6000);
      }
      setLoading(false);
    }

    fetchMemories();
  }, [tokenString]); // Re-run if query param changes

  if (loading) {
    return <div className="animate-fade-in" style={{ padding: "4rem", textAlign: "center", fontSize: "1.2rem", color: "var(--text-light)" }}>Opening the surprise box...</div>;
  }

  if (error || items.length === 0) {
    return (
      <main className="animate-fade-in" style={{ padding: "4rem 2rem", maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
        <div className="glass" style={{ padding: "3rem" }}>
          <h1 style={{ color: "var(--primary)", marginBottom: "1rem", fontSize: "3rem" }}>Oops!</h1>
          <p style={{ color: "var(--text-dark)", marginBottom: "2rem", fontSize: "1.1rem" }}>{error}</p>
          <Link href="/" className="glass-button" style={{ textDecoration: "none" }}>
            Return Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="animate-fade-in" style={{ padding: "2rem 2rem", maxWidth: "1200px", margin: "0 auto", position: "relative" }}>
      
      {showConfetti && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 9999 }}>
          <Confetti width={width} height={height} recycle={false} numberOfPieces={400} gravity={0.15} />
        </div>
      )}

      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <span style={{ fontSize: "4rem", display: "block", marginBottom: "1rem" }}>🎁</span>
        <h1 className="gradient-text" style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>A Surprise Memory Box</h1>
        <p style={{ color: "var(--text-light)", fontSize: "1.1rem" }}>A collection of special memories shared with you.</p>
      </div>

      <div className="memory-grid">
        {items.map((item) => {
          const images = parseImages(item.image_url);
          return (
            <div key={item.id} className="memory-item glass" style={{ padding: "1rem", gap: "0.5rem", position: "relative" }}>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                {images.length > 0 ? (
                  <div className="polaroid" style={{ width: "100%", maxWidth: "320px", alignSelf: "center", marginBottom: "0.5rem", marginTop: "0.5rem", position: "relative" }}>
                    <img src={images[0]} alt={item.title} />
                    {images.length > 1 && (
                      <div style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(0,0,0,0.6)", color: "white", padding: "4px 8px", borderRadius: "12px", fontSize: "0.8rem", fontWeight: "bold", backdropFilter: "blur(4px)" }}>
                        📸 {images.length} Photos
                      </div>
                    )}
                    <div className="polaroid-caption">{item.title}</div>
                  </div>
                ) : (
                  <h3 style={{ color: "var(--primary)", fontSize: "1.4rem" }}>{item.title}</h3>
                )}
                
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <p style={{ marginTop: "0.5rem", color: "var(--text-dark)", lineHeight: "1.5", whiteSpace: "pre-wrap" }}>
                    {item.description}
                  </p>
                  
                  <div style={{ marginTop: "auto", paddingTop: "1rem", fontSize: "0.85rem", color: "var(--text-light)" }}>
                    {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "4rem", display: "flex", justifyContent: "center" }}>
        <Link href="/" className="glass-button" style={{ background: "transparent", color: "var(--primary)", border: "1px solid var(--primary)", boxShadow: "none", textDecoration: "none", padding: "12px 32px" }}>
          Create your own Memory Box
        </Link>
      </div>

    </main>
  );
}

export default function ShareMultiPage() {
  return (
    <Suspense fallback={<div className="animate-fade-in" style={{ padding: "4rem", textAlign: "center", fontSize: "1.2rem", color: "var(--text-light)" }}>Loading your memories...</div>}>
      <ShareMultiContent />
    </Suspense>
  );
}
