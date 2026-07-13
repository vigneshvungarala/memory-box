"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Popup from "@/components/Popup";
import ShareModal from "@/components/ShareModal";
import ImageCropper from "@/components/ImageCropper";
import { MoreVertical, Edit2, Link as LinkIcon, MessageCircle, Trash2, Crop, X } from "lucide-react";

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

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShareAllModalOpen, setIsShareAllModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [memoryDate, setMemoryDate] = useState<string>("");
  const [popupConfig, setPopupConfig] = useState<{ isOpen: boolean, type: 'delete' | 'success', id?: string, imageUrlString?: string | null, title?: string, message?: string } | null>(null);
  const [imageToCrop, setImageToCrop] = useState<{ src: string, index: number, isExisting?: boolean } | null>(null);

  const router = useRouter();

  // Initialize date on mount to avoid hydration mismatch
  useEffect(() => {
    setMemoryDate(new Date().toISOString().split('T')[0]);
  }, []);

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItemId(null);
    setTitle("");
    setDescription("");
    setFiles([]);
    setExistingImageUrls([]);
    setMemoryDate(new Date().toISOString().split('T')[0]);
    setImageToCrop(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openEditModal = (item: any) => {
    setEditingItemId(item.id);
    setTitle(item.title);
    setDescription(item.description || "");
    setFiles([]);
    setExistingImageUrls(parseImages(item.image_url));
    setMemoryDate(new Date(item.created_at).toISOString().split('T')[0]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  useEffect(() => {
    async function getUserAndItems() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      const { data: items } = await supabase
        .from("content_items")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
        
      setItems(items || []);
      setLoading(false);
    }
    
    getUserAndItems();
  }, [router]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setUploading(true);

    try {
      let newUploadedUrls: string[] = [];

      if (files.length > 0) {
        const uploadPromises = files.map(async (f) => {
          const fileExt = f.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${user.id}/${fileName}`; 
          const { error: uploadError } = await supabase.storage.from("birthday-assets").upload(filePath, f);
          if (uploadError) throw uploadError;
          const { data: publicUrlData } = supabase.storage.from("birthday-assets").getPublicUrl(filePath);
          return publicUrlData.publicUrl;
        });
        newUploadedUrls = await Promise.all(uploadPromises);
      }

      // Combine existing URLs that weren't removed, plus new ones
      const allImageUrls = [...existingImageUrls, ...newUploadedUrls];
      const finalImageUrlString = allImageUrls.length > 0 ? JSON.stringify(allImageUrls) : null;

      if (editingItemId) {
        const updates = { 
          title, 
          description,
          image_url: finalImageUrlString,
          created_at: new Date(memoryDate).toISOString()
        };

        const { data, error } = await supabase
          .from("content_items")
          .update(updates)
          .eq("id", editingItemId)
          .eq("user_id", user.id)
          .select();

        if (error) throw error;

        if (data && data.length > 0) {
          setItems(items.map(item => item.id === editingItemId ? data[0] : item).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        } else {
          setItems(items.map(item => item.id === editingItemId ? { ...item, ...updates } : item).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        }
        closeModal();
      } else {
        const newItem = {
          user_id: user.id,
          title,
          description,
          image_url: finalImageUrlString,
          created_at: new Date(memoryDate).toISOString()
        };

        const { data, error } = await supabase
          .from("content_items")
          .insert([newItem])
          .select();

        if (error) throw error;

        if (data) {
          setItems([data[0], ...items].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
          closeModal();
        }
      }
    } catch (err: any) {
      alert("Error saving memory: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleShare = (token: string) => {
    const url = `${window.location.origin}/share/${token}`;
    navigator.clipboard.writeText(url);
    setPopupConfig({ isOpen: true, type: 'success', title: 'Link Copied!', message: 'Share link copied to clipboard!' });
  };

  const handleShareAll = () => {
    if (items.length === 0) return;
    const tokens = items.map((item: any) => item.share_token).join(',');
    const url = `${window.location.origin}/share-multi?t=${tokens}`;
    navigator.clipboard.writeText(url);
    setPopupConfig({ isOpen: true, type: 'success', title: 'Multi-Link Copied!', message: 'Share link for all memories copied to clipboard!' });
  };

  const handleWhatsAppShare = (token: string) => {
    const url = `${window.location.origin}/share/${token}`;
    const text = `I made a special memory for you! Open it here: ${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleWhatsAppShareAll = () => {
    if (items.length === 0) return;
    const tokens = items.map((item: any) => item.share_token).join(',');
    const url = `${window.location.origin}/share-multi?t=${tokens}`;
    const text = `I made a special Memory Box for you! Open your surprise here: ${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCropComplete = (croppedFile: File) => {
    if (imageToCrop) {
      if (imageToCrop.isExisting) {
        setFiles([...files, croppedFile]);
        setExistingImageUrls(existingImageUrls.filter((_, idx) => idx !== imageToCrop.index));
      } else {
        const newFiles = [...files];
        newFiles[imageToCrop.index] = croppedFile;
        setFiles(newFiles);
      }
    }
    setImageToCrop(null);
  };

  const confirmDelete = async () => {
    if (!popupConfig || popupConfig.type !== 'delete' || !popupConfig.id) return;
    const { id, imageUrlString } = popupConfig;
    setPopupConfig(null);

    try {
      const { error: dbError } = await supabase
        .from("content_items")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      
      if (dbError) throw dbError;
      setItems(items.filter(item => item.id !== id));

      const urls = parseImages(imageUrlString || null);
      for (const url of urls) {
        const urlParts = url.split('/');
        const fileName = urlParts.pop();
        const userId = urlParts.pop();
        if (fileName && userId) {
           await supabase.storage.from("birthday-assets").remove([`${userId}/${fileName}`]);
        }
      }
    } catch (err: any) {
      alert("Error deleting memory: " + err.message);
    }
  };

  const handleDelete = (id: string, imageUrlString: string | null) => {
    setPopupConfig({ isOpen: true, type: 'delete', id, imageUrlString, title: 'Delete Memory', message: 'Are you sure you want to permanently delete this memory? This cannot be undone.' });
  };

  if (loading) {
    return <div className="animate-fade-in" style={{ padding: "4rem", textAlign: "center", fontSize: "1.2rem", color: "var(--text-light)" }}>Loading your secure space...</div>;
  }

  return (
    <>
      <main className="animate-fade-in" style={{ padding: "2rem 2rem", maxWidth: "1200px", margin: "0 auto" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 className="gradient-text" style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>Your Memories</h1>
            <p style={{ color: "var(--text-light)" }}>Everything you've saved for the big surprise.</p>
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            {items.length > 0 && (
              <button 
                onClick={() => setIsShareAllModalOpen(true)} 
                className="glass-button" 
                style={{ background: "white", color: "var(--primary)", border: "1px solid var(--primary)", boxShadow: "none" }}
              >
                Share All
              </button>
            )}
            <button onClick={() => { closeModal(); setIsModalOpen(true); }} className="glass-button pulse-glow">
              + Add Memory
            </button>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="glass" style={{ textAlign: "center", padding: "6rem 2rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: "4rem", display: "block", marginBottom: "1rem" }}>📭</span>
            <h2 style={{ color: "var(--text-dark)", marginBottom: "1rem" }}>Your box is empty!</h2>
            <p style={{ color: "var(--text-light)", marginBottom: "2rem" }}>Start building the perfect gift by adding your first memory.</p>
            <button onClick={() => { closeModal(); setIsModalOpen(true); }} className="glass-button pulse-glow">
              Add Your First Memory
            </button>
          </div>
        ) : (
          <div className="memory-grid">
            {items.map((item) => {
              const images = parseImages(item.image_url);
              return (
                <div 
                  key={item.id} 
                  className="memory-item glass" 
                  style={{ 
                    padding: "1rem", 
                    gap: "0.5rem",
                    position: "relative",
                    zIndex: openMenuId === item.id ? 100 : 1
                  }}
                >
                  
                  <div style={{ position: "absolute", top: "0.5rem", right: "0.5rem", zIndex: 50 }}>
                    <button 
                      onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                      style={{ background: "rgba(255, 255, 255, 0.9)", border: "1px solid rgba(0,0,0,0.05)", width: "36px", height: "36px", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer", color: "var(--text-dark)", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", backdropFilter: "blur(4px)" }}
                    >
                      <MoreVertical size={18} />
                    </button>
                    
                    {openMenuId === item.id && (
                      <div className="solid-card animate-fade-in" style={{ 
                        position: "absolute", 
                        top: "100%", 
                        right: "0", 
                        marginTop: "0.5rem", 
                        padding: "0.4rem", 
                        display: "flex", 
                        flexDirection: "column", 
                        gap: "0.2rem",
                        minWidth: "180px",
                        zIndex: 50,
                        border: "1px solid rgba(0,0,0,0.05)",
                        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
                        borderRadius: "12px",
                        transformOrigin: "top right"
                      }}>
                        <button 
                          onClick={() => openEditModal(item)} 
                          style={{ background: "transparent", border: "none", textAlign: "left", padding: "0.6rem 0.8rem", cursor: "pointer", color: "var(--text-dark)", fontSize: "0.95rem", borderRadius: "8px", display: "flex", gap: "0.75rem", alignItems: "center", fontFamily: "inherit", transition: "background 0.2s ease" }}
                          onMouseOver={(e) => e.currentTarget.style.background = "rgba(157, 78, 221, 0.08)"}
                          onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
                        >
                          <Edit2 size={16} style={{ color: "var(--text-light)" }} />
                          Edit
                        </button>
                        
                        <button 
                          onClick={() => { handleShare(item.share_token); setOpenMenuId(null); }} 
                          style={{ background: "transparent", border: "none", textAlign: "left", padding: "0.6rem 0.8rem", cursor: "pointer", color: "var(--text-dark)", fontSize: "0.95rem", borderRadius: "8px", display: "flex", gap: "0.75rem", alignItems: "center", fontFamily: "inherit", transition: "background 0.2s ease" }}
                          onMouseOver={(e) => e.currentTarget.style.background = "rgba(157, 78, 221, 0.08)"}
                          onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
                        >
                          <LinkIcon size={16} style={{ color: "var(--text-light)" }} />
                          Copy Link
                        </button>
                        
                        <button 
                          onClick={() => { handleWhatsAppShare(item.share_token); setOpenMenuId(null); }} 
                          style={{ background: "transparent", border: "none", textAlign: "left", padding: "0.6rem 0.8rem", cursor: "pointer", color: "#25D366", fontSize: "0.95rem", borderRadius: "8px", display: "flex", gap: "0.75rem", alignItems: "center", fontFamily: "inherit", fontWeight: "500", transition: "background 0.2s ease" }}
                          onMouseOver={(e) => e.currentTarget.style.background = "rgba(37, 211, 102, 0.08)"}
                          onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
                        >
                          <MessageCircle size={16} color="#25D366" />
                          WhatsApp
                        </button>
                        
                        <div style={{ height: "1px", background: "rgba(0,0,0,0.06)", margin: "0.2rem 0" }} />
                        
                        <button 
                          onClick={() => { handleDelete(item.id, item.image_url); setOpenMenuId(null); }} 
                          style={{ background: "transparent", border: "none", textAlign: "left", padding: "0.6rem 0.8rem", cursor: "pointer", color: "#ef4444", fontSize: "0.95rem", borderRadius: "8px", display: "flex", gap: "0.75rem", alignItems: "center", fontFamily: "inherit", fontWeight: "500", transition: "background 0.2s ease" }}
                          onMouseOver={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)"}
                          onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
                        >
                          <Trash2 size={16} color="#ef4444" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <Link href={`/dashboard/memory/${item.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', flex: 1 }}>
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
                      <p style={{ marginTop: "0.5rem", color: "var(--text-dark)", lineHeight: "1.5" }}>
                        {item.description.length > 100 ? item.description.substring(0, 100) + '...' : item.description}
                      </p>
                      
                      <div style={{ marginTop: "auto", paddingTop: "1rem", fontSize: "0.85rem", color: "var(--text-light)" }}>
                        {new Date(item.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </Link>

                </div>
              );
            })}
          </div>
        )}

      </main>

      {isModalOpen && (
        <div className="modal-overlay animate-fade-in" onClick={closeModal}>
          <div className="solid-card" onClick={(e) => e.stopPropagation()} style={{ padding: "3rem 2rem", width: "100%", maxWidth: "500px", position: "relative", maxHeight: "90vh", overflowY: "auto" }}>
            
            <button 
              onClick={closeModal} 
              style={{ position: "absolute", top: "1rem", right: "1.5rem", background: "transparent", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "var(--text-light)" }}
            >
              ×
            </button>

            <h2 style={{ marginBottom: "2rem", color: "var(--primary)", textAlign: "center" }}>
              {editingItemId ? "Edit Memory" : "Add a New Memory"}
            </h2>
            
            <form onSubmit={handleAddItem} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
              <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", color: "var(--text-dark)", fontWeight: "500" }}>Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Our First Trip" 
                    className="solid-input" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", color: "var(--text-dark)", fontWeight: "500" }}>Date</label>
                  <input 
                    type="date" 
                    className="solid-input" 
                    value={memoryDate}
                    onChange={(e) => setMemoryDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", color: "var(--text-dark)", fontWeight: "500" }}>Message</label>
                <textarea 
                  placeholder="Write a sweet message..." 
                  className="solid-input" 
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", color: "var(--text-dark)", fontWeight: "500" }}>Photos</label>
                
                {(existingImageUrls.length > 0 || files.length > 0) && (
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                    
                    {/* Existing Images */}
                    {existingImageUrls.map((url, idx) => (
                      <div key={`existing-${idx}`} style={{ position: "relative", width: "80px", height: "80px", borderRadius: "8px", overflow: "hidden", border: "1px solid #e4e4e7" }}>
                        <img src={url} alt="Current" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setImageToCrop({ src: url, index: idx, isExisting: true });
                          }}
                          style={{ position: "absolute", bottom: "4px", right: "4px", background: "rgba(255,255,255,0.95)", color: "var(--text-dark)", border: "none", borderRadius: "50%", width: "26px", height: "26px", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.15)", zIndex: 10 }}
                          title="Crop this photo"
                        >
                          <Crop size={14} />
                        </button>
                        <button 
                          type="button"
                          onClick={() => setExistingImageUrls(existingImageUrls.filter(u => u !== url))}
                          style={{ position: "absolute", top: "4px", right: "4px", background: "rgba(239,68,68,0.9)", color: "white", border: "none", borderRadius: "50%", width: "22px", height: "22px", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.15)", zIndex: 10 }}
                          title="Remove this photo"
                        >
                          <X size={14} strokeWidth={2.5} />
                        </button>
                      </div>
                    ))}

                    {/* New File Previews */}
                    {files.map((file, idx) => (
                      <div key={`new-${idx}`} style={{ position: "relative", width: "80px", height: "80px", borderRadius: "8px", overflow: "hidden", border: "2px dashed var(--primary)" }}>
                        <img src={URL.createObjectURL(file)} alt="New" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", opacity: 0.8 }} />
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "var(--primary)", color: "white", fontSize: "9px", textAlign: "center", padding: "2px", fontWeight: "bold" }}>
                          NEW
                        </div>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setImageToCrop({ src: URL.createObjectURL(file), index: idx });
                          }}
                          style={{ position: "absolute", bottom: "4px", right: "4px", background: "rgba(255,255,255,0.95)", color: "var(--text-dark)", border: "none", borderRadius: "50%", width: "26px", height: "26px", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.15)", zIndex: 10 }}
                          title="Crop this photo"
                        >
                          <Crop size={14} />
                        </button>
                        <button 
                          type="button"
                          onClick={() => setFiles(files.filter(f => f !== file))}
                          style={{ position: "absolute", top: "4px", right: "4px", background: "rgba(239,68,68,0.9)", color: "white", border: "none", borderRadius: "50%", width: "22px", height: "22px", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.15)", zIndex: 10 }}
                          title="Remove this photo"
                        >
                          <X size={14} strokeWidth={2.5} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <input 
                  type="file" 
                  accept="image/*"
                  multiple
                  className="solid-input" 
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files) {
                      setFiles(Array.from(e.target.files));
                    } else {
                      setFiles([]);
                    }
                  }}
                  style={{ padding: "8px" }}
                />
                <p style={{ fontSize: "0.75rem", color: "var(--text-light)", marginTop: "4px" }}>You can select multiple photos at once.</p>
              </div>

              <button type="submit" className="glass-button" disabled={uploading} style={{ marginTop: "1rem" }}>
                {uploading ? "Saving securely..." : "Save to Memory Box"}
              </button>
            </form>
          </div>
        </div>
      )}

      {imageToCrop && (
        <ImageCropper
          imageSrc={imageToCrop.src}
          onCropComplete={handleCropComplete}
          onCancel={() => setImageToCrop(null)}
        />
      )}

      {popupConfig && popupConfig.type === 'delete' && (
        <Popup 
          isOpen={popupConfig.isOpen}
          title={popupConfig.title || ""}
          message={popupConfig.message || ""}
          type="danger"
          confirmText="Delete"
          onConfirm={confirmDelete}
          onCancel={() => setPopupConfig(null)}
        />
      )}

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
        isOpen={isShareAllModalOpen} 
        onClose={() => setIsShareAllModalOpen(false)}
        title="Share your Memory Box"
        onCopy={handleShareAll}
        onWhatsApp={handleWhatsAppShareAll}
      />
    </>
  );
}
