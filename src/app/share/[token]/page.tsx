"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";
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

export default function SharePage() {
  const params = useParams();
  const token = params.token as string;
  const { width, height } = useWindowSize();

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    async function fetchMemory() {
      if (!token) return;

      const { data, error } = await supabase
        .from("content_items")
        .select("*")
        .eq("share_token", token)
        .single();

      if (error || !data) {
        setError("This memory couldn't be found. It might have been deleted, or the link is incorrect.");
      } else {
        setItem(data);
        setImages(parseImages(data.image_url));
        // Trigger confetti when successfully loaded
        setShowConfetti(true);
        // Stop confetti after 6 seconds so it doesn't run forever
        setTimeout(() => setShowConfetti(false), 6000);
      }
      setLoading(false);
    }

    fetchMemory();
  }, [token]);

  if (loading) {
    return <div className="animate-fade-in" style={{ padding: "4rem", textAlign: "center", fontSize: "1.2rem", color: "var(--text-light)" }}>Opening the surprise...</div>;
  }

  if (error || !item) {
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
    <main className="animate-fade-in" style={{ padding: "4rem 2rem", maxWidth: "800px", margin: "0 auto", position: "relative" }}>
      
      {showConfetti && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 9999 }}>
          <Confetti width={width} height={height} recycle={false} numberOfPieces={300} gravity={0.15} />
        </div>
      )}

      <div className="glass" style={{ padding: "3rem", display: "flex", flexDirection: "column", gap: "2rem", alignItems: "center" }}>
        
        <div style={{ textAlign: "center" }}>
          <span style={{ fontSize: "4rem", display: "block", marginBottom: "1rem" }}>🎁</span>
          {images.length === 0 && (
            <h1 className="gradient-text" style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>{item.title}</h1>
          )}
          <p style={{ color: "var(--text-light)", marginTop: "0.5rem", fontSize: "1.1rem" }}>A special memory shared with you.</p>
        </div>

        {images.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "4rem", alignItems: "center", marginTop: "1rem", marginBottom: "3rem" }}>
            {images.map((img, idx) => (
              <div key={idx} className="polaroid" style={{ width: "100%", maxWidth: "500px", transform: `scale(1.02) rotate(${idx % 2 === 0 ? '-1deg' : '1deg'})` }}>
                <img src={img} alt={`${item.title} - photo ${idx + 1}`} />
                <div className="polaroid-caption" style={{ fontSize: "1rem", color: "var(--text-light)" }}>
                   {images.length > 1 ? `Photo ${idx + 1} of ${images.length}` : item.title}
                </div>
              </div>
            ))}
          </div>
        )}

        {item.description && item.description.trim() !== "" && (
          <div style={{ 
            background: "rgba(255, 255, 255, 0.5)", 
            padding: "2.5rem", 
            borderRadius: "16px", 
            width: "100%",
            boxShadow: "inset 0 2px 10px rgba(0,0,0,0.02)",
            position: "relative"
          }}>
            <span style={{ position: "absolute", top: "10px", left: "20px", fontSize: "3rem", color: "rgba(157, 78, 221, 0.1)", fontFamily: "serif" }}>"</span>
            <p style={{ color: "var(--text-dark)", fontSize: "1.2rem", lineHeight: "2", whiteSpace: "pre-wrap", textAlign: "center", position: "relative", zIndex: 1 }}>
              {item.description}
            </p>
            <span style={{ position: "absolute", bottom: "-10px", right: "20px", fontSize: "3rem", color: "rgba(157, 78, 221, 0.1)", fontFamily: "serif" }}>"</span>
          </div>
        )}
        
        <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
           <Link href="/" className="glass-button" style={{ background: "transparent", color: "var(--primary)", border: "1px solid var(--primary)", boxShadow: "none", textDecoration: "none" }}>
            Create your own Memory Box
          </Link>
        </div>

      </div>
    </main>
  );
}
