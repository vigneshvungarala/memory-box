"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <main className="animate-fade-in" style={{ 
      padding: "4rem 2rem", 
      maxWidth: "1000px", 
      margin: "0 auto", 
      textAlign: "center",
      minHeight: "80vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      position: "relative"
    }}>
      {/* Decorative floating elements */}
      {mounted && (
        <>
          <div style={{ position: "absolute", top: "10%", left: "5%", animation: "float 6s ease-in-out infinite" }}>
            <span style={{ fontSize: "3rem" }}>✨</span>
          </div>
          <div style={{ position: "absolute", bottom: "20%", right: "10%", animation: "float 8s ease-in-out infinite reverse" }}>
            <span style={{ fontSize: "4rem", filter: "blur(2px)", opacity: 0.8 }}>💖</span>
          </div>
          <div style={{ position: "absolute", top: "40%", left: "80%", animation: "float 7s ease-in-out infinite 1s" }}>
            <span style={{ fontSize: "2.5rem" }}>🎁</span>
          </div>
        </>
      )}

      <div className="glass" style={{ padding: "5rem 3rem", zIndex: 10, maxWidth: "600px", width: "100%" }}>
        <h1 className="gradient-text" style={{ fontSize: "4rem", marginBottom: "1.5rem", lineHeight: "1.1" }}>
          The Memory Box
        </h1>
        <p style={{ fontSize: "1.3rem", color: "var(--text-light)", marginBottom: "3rem", lineHeight: "1.6" }}>
          A secure, beautiful, and private collection of your most cherished surprises and letters. 
        </p>
        <Link href="/login" className="glass-button pulse-glow" style={{ textDecoration: "none", fontSize: "1.2rem", padding: "16px 32px", display: "inline-block" }}>
          Open the Box
        </Link>
      </div>
    </main>
  );
}
