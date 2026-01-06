import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import type { Session } from '@supabase/supabase-js';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import { Loader2, ArrowLeft, LogOut } from 'lucide-react';
import './App.css';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLanding, setShowLanding] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) setShowLanding(false);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setShowLanding(false);
      } else {
        setShowLanding(true);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const getUserName = () => {
    if (!session || !session.user) return 'Usuário';
    const fullName = session.user.user_metadata.full_name;
    if (fullName) {
      const names = fullName.trim().split(' ');
      if (names.length === 1) return names[0];
      return `${names[0]} ${names[names.length - 1]}`;
    }
    return session.user.email?.split('@')[0];
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)', color: 'var(--accent)' }}>
        <Loader2 className="spin-animation" size={50} />
        <style>{`.spin-animation { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!session && showLanding) {
      return <LandingPage onStart={() => setShowLanding(false)} />;
  }

  return (
    <div className="container" style={{ padding: 0, maxWidth: '100%', margin: 0, width: '100%', minHeight: '100vh' }}>
      
      {!session ? (
        <div style={{ position: 'relative', width: '100%', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.5s ease' }}>
            
            <div style={{ position: 'absolute', top: '30px', left: '30px', zIndex: 50 }}>
                <button 
                    onClick={() => setShowLanding(true)} 
                    style={{
                        background: 'rgba(255,255,255,0.05)', 
                        border: '1px solid rgba(255,255,255,0.1)', 
                        color: '#94a3b8', 
                        cursor: 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        padding: '10px 18px',
                        borderRadius: '12px',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        backdropFilter: 'blur(4px)',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--accent)';
                        e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                        e.currentTarget.style.color = '#94a3b8';
                    }}
                >
                    <ArrowLeft size={18}/> Início
                </button>
            </div>

            <Auth />
        </div>
      ) : (
        // AQUI ESTAVA O PROBLEMA: maxWidth mudado de 800px para 1200px
        <div style={{ animation: 'fadeIn 0.5s ease-in', width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '20px', boxSizing: 'border-box' }}>
           
           <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '15px', marginBottom: '30px', color: '#64748b', fontSize: '0.9rem' }}>
              <span>Logado como <strong style={{ color: '#f8fafc' }}>{getUserName()}</strong></span>
              <button 
                  onClick={() => supabase.auth.signOut()} 
                  className="btn-danger" 
                  style={{ padding: '8px 16px', fontSize: '0.8rem', width: 'auto', display: 'flex', alignItems: 'center', gap: 5, borderRadius: '8px' }}
              >
                  <LogOut size={14}/> Sair
              </button>
           </div>
           
           <Dashboard />
        </div>
      )}
    </div>
  );
}

export default App;