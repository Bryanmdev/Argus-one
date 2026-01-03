import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import type { Session } from '@supabase/supabase-js';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import { Loader2 } from 'lucide-react';
import './App.css';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)', color: 'var(--accent)' }}>
        <Loader2 className="spin-animation" size={50} />
        <style>{`.spin-animation { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // --- FUNÇÃO DE FORMATAR O NOME ---
  const getUserName = () => {
    if (!session || !session.user) return 'Usuário';
    
    const fullName = session.user.user_metadata.full_name;
    
    if (fullName) {
      // Divide o nome pelos espaços
      const names = fullName.trim().split(' ');
      
      // Se tiver só um nome, retorna ele
      if (names.length === 1) return names[0];
      
      // Se tiver mais, pega o Primeiro e o Último
      return `${names[0]} ${names[names.length - 1]}`;
    }
    
    // Fallback para o email se não tiver nome
    return session.user.email?.split('@')[0];
  };

  return (
    <div className="container">
      {!session ? (
        <Auth />
      ) : (
        <div style={{animation: 'fadeIn 0.5s ease-in'}}>
           <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '15px', marginBottom: '10px', color: '#64748b', fontSize: '0.9rem' }}>
             
             {/* Mostra o nome formatado aqui */}
             <span>Logado como <strong style={{ color: '#f8fafc' }}>{getUserName()}</strong></span>
             
             <button onClick={() => supabase.auth.signOut()} className="btn-danger" style={{ padding: '6px 12px', fontSize: '0.8rem', width: 'auto' }}>Sair</button>
           </div>
           
           <Dashboard />
        </div>
      )}
    </div>
  );
}

export default App;