import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import type { Session } from '@supabase/supabase-js';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import './App.css'; 

function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
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
    return session.user.email;
  };

  return (
    // AQUI ESTÁ O SEGREDO: maxWidth 1200px para telas grandes
    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      {!session ? (
        <Auth />
      ) : (
        <div>
           {/* Cabeçalho de Boas Vindas */}
           <div style={{ 
             display: 'flex', 
             justifyContent: 'flex-end', 
             alignItems: 'center', 
             gap: '15px',
             marginBottom: '20px',
             color: '#94a3b8'
           }}>
             <span>
               Logado como: <strong style={{ color: '#f8fafc' }}>{getUserName()}</strong>
             </span>
             <button 
               onClick={() => supabase.auth.signOut()}
               style={{ 
                 padding: '5px 15px', 
                 fontSize: '0.8em',
                 background: 'transparent',
                 border: '1px solid #ef4444',
                 color: '#ef4444',
                 width: 'auto',
                 cursor: 'pointer'
               }}
             >
               Sair
             </button>
           </div>
           
           <Dashboard />
        </div>
      )}
    </div>
  );
}

export default App;