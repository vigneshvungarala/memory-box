import React from "react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCopy: () => void;
  onWhatsApp: () => void;
  title?: string;
}

export default function ShareModal({ isOpen, onClose, onCopy, onWhatsApp, title = "Share Memory" }: ShareModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay animate-fade-in" style={{ zIndex: 9999 }} onClick={onClose}>
      <div 
        className="solid-card" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          padding: "2.5rem 2rem", 
          width: "90%", 
          maxWidth: "350px", 
          textAlign: "center",
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem"
        }}
      >
        <h3 style={{ fontSize: "1.4rem", color: "var(--text-dark)", margin: 0 }}>{title}</h3>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <button 
            onClick={() => { onCopy(); onClose(); }}
            className="glass-button"
            style={{ width: "100%", background: "white", color: "var(--primary)", border: "2px solid var(--primary)", boxShadow: "none" }}
          >
            Copy Link
          </button>
          
          <button 
            onClick={() => { onWhatsApp(); onClose(); }}
            className="glass-button"
            style={{ width: "100%", background: "#25D366", color: "white", border: "none", boxShadow: "0 4px 14px 0 rgba(37, 211, 102, 0.39)" }}
          >
            Share to WhatsApp
          </button>
        </div>

        <button 
          onClick={onClose}
          style={{ background: "transparent", border: "none", color: "var(--text-light)", textDecoration: "underline", cursor: "pointer", marginTop: "0.5rem" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
