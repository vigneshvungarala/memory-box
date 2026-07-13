"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Popup from "@/components/Popup";
import Link from "next/link";
import { Save, Lock, User, Info } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  
  // Profile State
  const [fullName, setFullName] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  // Password State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [popupConfig, setPopupConfig] = useState<{ isOpen: boolean, type: 'success' | 'danger', title: string, message: string } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      
      if (user.user_metadata) {
        setFullName(user.user_metadata.full_name || "");
      }
      setLoading(false);
    };

    fetchUser();
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: fullName
      }
    });

    setIsSavingProfile(false);

    if (error) {
      setPopupConfig({ isOpen: true, type: 'danger', title: 'Error', message: error.message });
    } else {
      setPopupConfig({ isOpen: true, type: 'success', title: 'Profile Updated', message: 'Your profile details have been saved successfully.' });
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setPopupConfig({ isOpen: true, type: 'danger', title: 'Password Mismatch', message: 'The new passwords do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      setPopupConfig({ isOpen: true, type: 'danger', title: 'Weak Password', message: 'Password should be at least 6 characters long.' });
      return;
    }

    setIsSavingPassword(true);
    
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    setIsSavingPassword(false);

    if (error) {
      setPopupConfig({ isOpen: true, type: 'danger', title: 'Error', message: error.message });
    } else {
      setNewPassword("");
      setConfirmPassword("");
      setPopupConfig({ isOpen: true, type: 'success', title: 'Password Changed', message: 'Your password has been successfully updated.' });
    }
  };

  if (loading) {
    return <div style={{ padding: "4rem", textAlign: "center", color: "var(--text-light)" }}>Loading profile...</div>;
  }

  return (
    <main className="animate-fade-in" style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/dashboard" className="glass-button" style={{ textDecoration: "none", color: "var(--primary)", background: "white", padding: "8px 16px", borderRadius: "20px", display: "inline-flex", alignItems: "center", gap: "0.5rem", border: "none", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
          <span>←</span> Back
        </Link>
        <h1 className="gradient-text" style={{ fontSize: "2.5rem", margin: 0 }}>Your Profile</h1>
        <div style={{ width: "80px" }}></div> {/* spacer */}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {/* Profile Details Form */}
        <form onSubmit={handleUpdateProfile} className="solid-card" style={{ padding: "2rem" }}>
          <h2 style={{ color: "var(--primary)", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <User size={24} /> Personal Details
          </h2>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", color: "var(--text-dark)", fontWeight: "500" }}>
                Full Name
              </label>
              <input 
                type="text" 
                className="solid-input" 
                placeholder="Enter your full name" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <button type="submit" className="glass-button pulse-glow" disabled={isSavingProfile} style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {isSavingProfile ? "Saving..." : <><Save size={18} /> Save Details</>}
            </button>
          </div>
        </form>

        {/* Password Update Form */}
        <form onSubmit={handleUpdatePassword} className="solid-card" style={{ padding: "2rem" }}>
          <h2 style={{ color: "var(--primary)", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Lock size={24} /> Security
          </h2>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-dark)", fontWeight: "500" }}>New Password</label>
              <input 
                type="password" 
                className="solid-input" 
                placeholder="Enter new password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-dark)", fontWeight: "500" }}>Confirm New Password</label>
              <input 
                type="password" 
                className="solid-input" 
                placeholder="Confirm new password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="glass-button" disabled={isSavingPassword || !newPassword} style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: "0.5rem", background: "white", color: "var(--primary)", border: "1px solid var(--primary)", boxShadow: "none" }}>
              {isSavingPassword ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>

      {popupConfig && (
        <Popup 
          isOpen={popupConfig.isOpen}
          title={popupConfig.title}
          message={popupConfig.message}
          type={popupConfig.type}
          confirmText="Got it"
          onConfirm={() => setPopupConfig(null)}
          hideCancel={true}
        />
      )}
    </main>
  );
}
