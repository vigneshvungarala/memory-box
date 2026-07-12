"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        // Domain Allowlisting to prevent fake/burner emails
        const allowedDomains = ["@gmail.com", "@yahoo.com", "@outlook.com", "@hotmail.com", "@icloud.com", "@aol.com"];
        const isAllowed = allowedDomains.some(domain => email.toLowerCase().endsWith(domain));
        
        if (!isAllowed) {
          setError("Please use a valid primary email address (e.g., @gmail.com) to sign up.");
          setLoading(false);
          return;
        }

        // Calling Supabase to create a new user
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        
        router.push("/dashboard");
      } else {
        // Calling Supabase to log an existing user in
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        
        // Redirect to the dashboard upon success!
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: "4rem 2rem", maxWidth: "480px", margin: "0 auto" }}>
      <div className="glass" style={{ padding: "3rem 2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        
        <div style={{ textAlign: "center" }}>
          <h1 style={{ color: "var(--primary)", fontSize: "2rem", marginBottom: "0.5rem" }}>
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h1>
          <p style={{ color: "var(--text-light)" }}>
            {isSignUp ? "Start creating your memory box" : "Log in to access your surprises"}
          </p>
        </div>

        {error && (
          <div style={{ padding: "1rem", background: "rgba(255,0,0,0.1)", color: "red", borderRadius: "8px", fontSize: "0.9rem" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500", fontSize: "0.9rem" }}>Email</label>
            <input 
              type="email" 
              className="glass-input" 
              placeholder="you@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500", fontSize: "0.9rem" }}>Password</label>
            <div style={{ position: "relative" }}>
              <input 
                type={showPassword ? "text" : "password"} 
                className="glass-input" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: "100%", paddingRight: "40px", boxSizing: "border-box" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-light)",
                  padding: "0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </button>
            </div>
          </div>
          
          <button type="submit" className="glass-button" style={{ marginTop: "1rem", width: "100%" }} disabled={loading}>
            {loading ? "Processing..." : (isSignUp ? "Sign Up" : "Log In")}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <button 
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setEmail("");
              setPassword("");
            }}
            style={{ 
              background: "none", 
              border: "none", 
              color: "var(--primary)", 
              fontFamily: "var(--font-inter)",
              cursor: "pointer",
              textDecoration: "underline",
              fontSize: "0.9rem"
            }}
          >
            {isSignUp ? "Already have an account? Log in" : "Need an account? Sign up"}
          </button>
        </div>

      </div>
    </main>
  );
}
