"use client";

import React from "react";

interface PopupProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: "info" | "danger" | "success";
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  hideCancel?: boolean;
}

export default function Popup({
  isOpen,
  title,
  message,
  type = "info",
  confirmText = "OK",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  hideCancel = false
}: PopupProps) {
  if (!isOpen) return null;

  const getButtonColor = () => {
    switch (type) {
      case "danger": return "#ef4444";
      case "success": return "#10b981";
      case "info":
      default:
        return "var(--primary)";
    }
  };

  return (
    <div className="modal-overlay animate-fade-in" style={{ zIndex: 9999 }} onClick={onCancel}>
      <div 
        className="solid-card" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          padding: "2.5rem 2rem", 
          width: "90%", 
          maxWidth: "400px", 
          textAlign: "center",
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          border: "1px solid rgba(255,255,255,0.5)",
          display: "flex",
          flexDirection: "column",
          gap: "1rem"
        }}
      >
        <h3 style={{ fontSize: "1.4rem", color: "var(--text-dark)", margin: 0 }}>{title}</h3>
        <p style={{ color: "var(--text-light)", marginBottom: "1rem", lineHeight: "1.5", fontSize: "0.95rem" }}>{message}</p>
        
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "0.5rem" }}>
          {!hideCancel && onCancel && (
            <button 
              onClick={onCancel}
              style={{
                background: "var(--bg-light)",
                color: "var(--text-dark)",
                border: "1px solid #e4e4e7",
                padding: "0.7rem 1.4rem",
                borderRadius: "24px",
                cursor: "pointer",
                fontWeight: "500",
                fontSize: "0.95rem",
                flex: 1
              }}
            >
              {cancelText}
            </button>
          )}
          
          <button 
            onClick={onConfirm}
            style={{
              background: getButtonColor(),
              color: "white",
              border: "none",
              padding: "0.7rem 1.4rem",
              borderRadius: "24px",
              cursor: "pointer",
              fontWeight: "500",
              fontSize: "0.95rem",
              boxShadow: `0 4px 10px ${getButtonColor()}40`,
              flex: 1
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
