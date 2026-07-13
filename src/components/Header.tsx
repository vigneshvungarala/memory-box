"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { User } from 'lucide-react';

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <header className="glass-header" style={{ 
      padding: '1rem 2rem', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <Link href="/" style={{ 
        textDecoration: 'none', 
        color: 'var(--primary)', 
        fontWeight: 'bold', 
        fontSize: '1.5rem', 
        fontFamily: 'var(--font-outfit)',
        letterSpacing: '-0.05em',
        transition: 'opacity 0.2s'
      }}>
        The Memory Box
      </Link>
      <nav style={{ display: 'flex', gap: '1rem' }}>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/profile" className="glass-button" style={{ 
              textDecoration: 'none', 
              padding: '6px 16px 6px 6px', 
              fontSize: '0.95rem', 
              background: 'white', 
              color: 'var(--text-dark)', 
              border: '1px solid rgba(0,0,0,0.05)', 
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.6rem',
              borderRadius: '24px'
            }}>
              <div style={{ background: 'var(--primary)', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={16} />
              </div>
              <span style={{ fontWeight: '500', paddingRight: '4px' }}>
                {user.user_metadata?.full_name ? `Hi, ${user.user_metadata.full_name.split(" ")[0]}` : "Profile"}
              </span>
            </Link>
            <button onClick={handleSignOut} className="glass-button" style={{ textDecoration: 'none', padding: '8px 20px', fontSize: '0.95rem', background: 'transparent', color: 'var(--text-light)', border: '1px solid #e4e4e7', boxShadow: 'none' }}>
              Log Out
            </button>
          </div>
        ) : (
          <Link href="/login" className="glass-button" style={{ textDecoration: 'none', padding: '8px 20px', fontSize: '1rem', background: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)', boxShadow: 'none' }}>
            Login
          </Link>
        )}
      </nav>
    </header>
  );
}
