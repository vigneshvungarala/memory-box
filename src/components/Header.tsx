"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

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
          <>
            <Link href="/profile" className="glass-button" style={{ textDecoration: 'none', padding: '8px 20px', fontSize: '1rem', background: 'white', color: 'var(--primary)', border: '1px solid var(--primary)', boxShadow: 'none' }}>
              Profile
            </Link>
            <button onClick={handleSignOut} className="glass-button" style={{ textDecoration: 'none', padding: '8px 20px', fontSize: '1rem', background: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)', boxShadow: 'none' }}>
              Log Out
            </button>
          </>
        ) : (
          <Link href="/login" className="glass-button" style={{ textDecoration: 'none', padding: '8px 20px', fontSize: '1rem', background: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)', boxShadow: 'none' }}>
            Login
          </Link>
        )}
      </nav>
    </header>
  );
}
