"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Popup from "@/components/Popup";
import ShareModal from "@/components/ShareModal";
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

export default function PrivateMemoryDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(true);
  const [popupConfig, setPopupConfig] = useState<{ isOpen: boolean, type: 'success', title?: string, message?: string } | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    async function fetchMemory() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("content_items")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        alert("Memory not found or you don't have access.");
        router.push("/dashboard");
        return;
      }

      if (data.user_id !== user.id) {
         router.push("/dashboard");
         return;
      }

      setItem(data);
      setImages(parseImages(data.image_url));
      setLoading(false);
    }

    if (id) fetchMemory();
  }, [id, router]);

  if (loading) {
    return <div className="animate-fade-in" style={{ padding: "4rem", textAlign: "center", fontSize: "1.2rem", color: "var(--text-light)" }}>Loading your private album...</div>;
  }

  if (!item) return null;

  return (
    <main className="animate-fade-in" style={{ padding: "4rem 2rem", maxWidth: "800px", margin: "0 auto", position: "relative" }}>
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={150} colors={['#9d4edd', '#ff9a9e', '#fecfef']} />}
      
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <Link href="/dashboard" className="pulse-glow" style={{ textDecoration: "none", color: "var(--primary)", display: "inline-flex", alignItems: "center", gap: "0.5rem", fontWeight: "bold", background: "white", padding: "8px 16px", borderRadius: "20px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
          <span>←</span> Back to Dashboard
        </Link>
        
        <button 
          onClick={() => setIsShareModalOpen(true)}
          className="glass-button"
          style={{ padding: "8px 16px", fontSize: "0.95rem", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
        >
          Share
        </button>
      </div>

      <div className="glass" style={{ padding: "3rem 2rem", position: "relative", overflow: "hidden" }}>
        
        {/* Decorative elements */}
        <div style={{ position: "absolute", top: "-20px", left: "-20px", fontSize: "4rem", opacity: 0.1, transform: "rotate(-15deg)" }}>✨</div>
        <div style={{ position: "absolute", bottom: "-20px", right: "-20px", fontSize: "4rem", opacity: 0.1, transform: "rotate(15deg)" }}>💖</div>

        <h1 className="gradient-text" style={{ fontSize: "2.5rem", marginBottom: "1rem", textAlign: "center", position: "relative", zIndex: 1 }}>{item.title}</h1>
        
        {item.description && item.description.trim() !== "" && (
          <p style={{ color: "var(--text-dark)", fontSize: "1.1rem", lineHeight: "1.8", textAlign: "center", marginBottom: "3rem", whiteSpace: "pre-wrap", position: "relative", zIndex: 1 }}>
            "{item.description}"
          </p>
        )}

        {images.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "4rem", alignItems: "center" }}>
            {images.map((img, idx) => (
              <div key={idx} className="polaroid" style={{ width: "100%", maxWidth: "320px", transform: `rotate(${idx % 2 === 0 ? '-2deg' : '2deg'})` }}>
                <img src={img} alt={`${item.title} - photo ${idx + 1}`} />
                <div className="polaroid-caption" style={{ fontSize: "1rem", color: "var(--text-light)" }}>
                   {images.length > 1 ? `Photo ${idx + 1} of ${images.length}` : item.title}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: "4rem", textAlign: "center", color: "var(--text-light)", fontSize: "0.9rem" }}>
          Saved on {new Date(item.created_at).toLocaleDateString()}
        </div>
      </div>

      {popupConfig && popupConfig.type === 'success' && (
        <Popup 
          isOpen={popupConfig.isOpen}
          title={popupConfig.title || ""}
          message={popupConfig.message || ""}
          type="success"
          confirmText="Awesome"
          onConfirm={() => setPopupConfig(null)}
          hideCancel={true}
        />
      )}

      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)}
        title="Share this Memory"
        onCopy={() => {
          const url = `${window.location.origin}/share/${item.share_token}`;
          navigator.clipboard.writeText(url);
          setPopupConfig({ isOpen: true, type: 'success', title: 'Link Copied!', message: 'Share link copied to clipboard!' });
        }}
        onWhatsApp={() => {
          const url = `${window.location.origin}/share/${item.share_token}`;
          const text = `I made a special memory for you! Open it here: ${url}`;
          window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
        }}
      />
    </main>
  );
}
