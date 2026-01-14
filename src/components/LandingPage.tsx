import { Lock, CreditCard, Search, ArrowRight, Github, Linkedin } from 'lucide-react';
import '../App.css';

interface LandingPageProps {
  onStart: () => void;
}

// Logo SVG
const ArgusLogoReal = () => (
    <svg viewBox="0 0 200 200" width="40" height="40" xmlns="http://www.w3.org/2000/svg" style={{ color: 'var(--accent)' }}>
        <path fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" d="M20,100 C20,100 60,40 100,40 C140,40 180,100 180,100 C180,100 140,160 100,160 C60,160 20,100 20,100 Z M100,40 L100,20 M100,180 L100,160 M20,100 L10,100 M190,100 L180,100 M50,65 L40,55 M160,55 L150,65 M50,135 L40,145 M160,145 L150,135" />
        <path fill="none" stroke="white" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" d="M100,130 C116.568542,130 130,116.568542 130,100 C130,83.4314575 116.568542,70 100,70 C83.4314575,70 70,83.4314575 70,100 C70,116.568542 83.4314575,130 100,130 Z M100,110 C105.522847,110 110,105.522847 110,100 C110,94.4771525 105.522847,90 100,90 C94.4771525,90 90,94.4771525 90,100 C90,105.522847 94.4771525,110 100,110 Z M100,100 L130,100 M100,100 L70,100 M100,100 L100,70 M100,100 L100,130" />
    </svg>
);

export default function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-color)', width: '100vw', overflowX: 'hidden' }}>
      
      {/* NAVBAR */}
      <nav className="landing-nav" style={{ padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ArgusLogoReal />
            <h2 style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: '1.4rem', letterSpacing: '-0.5px', color: 'white' }}>
                Argus<span style={{ color: 'var(--accent)' }}>One</span>
            </h2>
        </div>
        
        {/* BOTÃO "ENTRAR" COMPACTO */}
        <button 
            onClick={onStart} 
            style={{ 
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)', 
                color: '#cbd5e1', 
                
                // --- AQUI ESTÁ A MUDANÇA ---
                padding: '6px 14px',   // Bem justo ao texto
                fontSize: '0.8rem',    // Texto levemente menor
                minWidth: '0',         // Garante que não estique
                width: 'auto',
                // ---------------------------

                borderRadius: '6px',   // Cantos levemente arredondados (menos "bolinha")
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'var(--font-display)',
                transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => { 
                e.currentTarget.style.borderColor = 'white'; 
                e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => { 
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; 
                e.currentTarget.style.color = '#cbd5e1';
            }}
        >
           Entrar
        </button>
      </nav>

      {/* HERO SECTION */}
      <header className="landing-hero" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px 20px' }}>
         
         <div style={{ marginBottom: '30px', padding: '6px 16px', background: 'rgba(139, 92, 246, 0.08)', borderRadius: '30px', color: '#a78bfa', fontSize: '0.8rem', border: '1px solid rgba(139, 92, 246, 0.2)', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            Versão 1.0 Disponível
         </div>
         
         <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(3.5rem, 10vw, 6rem)', lineHeight: 1, maxWidth: '1100px', margin: '0 0 30px 0', fontWeight: 700, color: 'white', letterSpacing: '-2.5px' }}>
            Sua Fortaleza Digital <br/>
            <span style={{ background: 'linear-gradient(to right, #a78bfa, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Privada e Segura.
            </span>
         </h1>
         
         <p style={{ fontSize: '1.25rem', color: '#94a3b8', maxWidth: '650px', lineHeight: 1.6, marginBottom: '50px', fontWeight: 300 }}>
            A suíte completa para sua segurança. Gerencie senhas, proteja documentos e verifique ameaças digitais com criptografia de ponta a ponta.
         </p>

         <button onClick={onStart} className="btn-primary" style={{ padding: '14px 36px', fontSize: '1rem', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 0 20px -5px rgba(139, 92, 246, 0.5)', width: 'auto' }}>
            Começar Agora <ArrowRight size={18} />
         </button>
      </header>

      {/* FEATURES GRID */}
      <section style={{ padding: '40px 5% 80px 5%' }}>
         <div className="dashboard-grid">
            <div className="card" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
                <div style={{ width: 45, height: 45, background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}><Lock size={20} color="#8b5cf6" /></div>
                <h3 style={{ marginTop: 0, color: 'white', fontFamily: "'Outfit', sans-serif", fontSize: '1.2rem' }}>Cofre de Senhas</h3>
                <p style={{ color: '#94a3b8', lineHeight: 1.5, fontSize: '0.95rem' }}>Armazenamento seguro com criptografia militar AES-256 no client-side.</p>
            </div>
            <div className="card" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
                <div style={{ width: 45, height: 45, background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}><CreditCard size={20} color="#f59e0b" /></div>
                <h3 style={{ marginTop: 0, color: 'white', fontFamily: "'Outfit', sans-serif", fontSize: '1.2rem' }}>Carteira Digital</h3>
                <p style={{ color: '#94a3b8', lineHeight: 1.5, fontSize: '0.95rem' }}>Seus cartões e documentos sempre à mão, protegidos contra olhares curiosos.</p>
            </div>
            <div className="card" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
                <div style={{ width: 45, height: 45, background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}><Search size={20} color="#ef4444" /></div>
                <h3 style={{ marginTop: 0, color: 'white', fontFamily: "'Outfit', sans-serif", fontSize: '1.2rem' }}>Scanner de Ameaças</h3>
                <p style={{ color: '#94a3b8', lineHeight: 1.5, fontSize: '0.95rem' }}>Verifique URLs e telefones suspeitos usando a inteligência do VirusTotal.</p>
            </div>
         </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '40px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>ArgusOne © 2026 • Segurança em primeiro lugar.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', alignItems: 'center' }}>
            <a href="https://linkedin.com/in/bryan-miraanda" target="_blank" rel="noreferrer" style={{ color: '#94a3b8', transition: 'color 0.2s' }}><Linkedin size={18} /></a>
            <a href="https://github.com/Bryanmdev" target="_blank" rel="noreferrer" style={{ color: '#94a3b8', transition: 'color 0.2s' }}><Github size={18} /></a>
        </div>
      </footer>
    </div>
  );
}