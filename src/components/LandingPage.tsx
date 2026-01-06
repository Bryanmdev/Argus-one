import { Lock, CreditCard, Search, ArrowRight, Github, Linkedin } from 'lucide-react';
import '../App.css';

interface LandingPageProps {
  onStart: () => void;
}

// SUA LOGO REAL (Copiada do SplashScreen.tsx)
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
      <nav className="landing-nav" style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ArgusLogoReal />
            <h2 style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: '1.5rem', letterSpacing: '-0.5px', color: 'white' }}>
                Argus<span style={{ color: 'var(--accent)' }}>One</span>
            </h2>
        </div>
        <button onClick={onStart} className="btn-primary" style={{ width: 'auto', borderRadius: '50px', fontSize: '0.9rem' }}>
           Entrar
        </button>
      </nav>

      {/* HERO SECTION */}
      <header className="landing-hero" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px 20px' }}>
         <div style={{ marginBottom: '25px', padding: '6px 16px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '30px', color: '#a78bfa', fontSize: '0.8rem', border: '1px solid rgba(139, 92, 246, 0.2)', fontWeight: 600, letterSpacing: '1px' }}>
            VERSÃO BETA 1.0 DISPONÍVEL
         </div>
         
         <h1 style={{ fontFamily: "'Outfit', sans-serif", maxWidth: '900px', margin: '0 0 25px 0', fontWeight: 800, color: 'white' }}>
            Sua Fortaleza Digital <br/>
            <span style={{ background: 'linear-gradient(to right, #a78bfa, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Privada e Segura.</span>
         </h1>
         
         <p style={{ fontSize: '1.15rem', color: '#94a3b8', maxWidth: '600px', lineHeight: 1.6, marginBottom: '40px' }}>
            A suíte completa para sua segurança. Gerencie senhas, proteja documentos e verifique ameaças digitais com criptografia de ponta a ponta.
         </p>

         <button onClick={onStart} className="btn-primary" style={{ padding: '16px 40px', fontSize: '1.1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 30px -10px rgba(139, 92, 246, 0.5)' }}>
            Começar Agora <ArrowRight size={20} />
         </button>
      </header>

      {/* FEATURES GRID */}
      <section style={{ padding: '60px 5%', background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.3))' }}>
         <div className="dashboard-grid">
            
            <div className="card">
                <div style={{ width: 50, height: 50, background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                    <Lock size={24} color="#8b5cf6" />
                </div>
                <h3 style={{ marginTop: 0, color: 'white' }}>Cofre de Senhas</h3>
                <p style={{ color: '#94a3b8', lineHeight: 1.5 }}>Armazenamento seguro com criptografia militar AES-256 no client-side.</p>
            </div>

            <div className="card">
                <div style={{ width: 50, height: 50, background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                    <CreditCard size={24} color="#f59e0b" />
                </div>
                <h3 style={{ marginTop: 0, color: 'white' }}>Carteira Digital</h3>
                <p style={{ color: '#94a3b8', lineHeight: 1.5 }}>Seus cartões e documentos sempre à mão, protegidos contra olhares curiosos.</p>
            </div>

            <div className="card">
                <div style={{ width: 50, height: 50, background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                    <Search size={24} color="#ef4444" />
                </div>
                <h3 style={{ marginTop: 0, color: 'white' }}>Scanner de Ameaças</h3>
                <p style={{ color: '#94a3b8', lineHeight: 1.5 }}>Verifique URLs e telefones suspeitos usando a inteligência do VirusTotal.</p>
            </div>

         </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '40px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', background: '#020617' }}>
        <div style={{ marginBottom: '20px', opacity: 0.8 }}>
             <ArgusLogoReal />
        </div>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
            ArgusOne © 2026 • Todos os direitos reservados.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', alignItems: 'center' }}>
            <span style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>Desenvolvido por <strong>Bryan Miranda</strong></span>
            <div style={{ height: '15px', width: '1px', background: '#334155' }}></div>
            <a href="https://linkedin.com/in/bryanmiranda" target="_blank" rel="noreferrer" style={{ color: '#94a3b8' }}><Linkedin size={18} /></a>
            <a href="https://github.com/bryanmiranda" target="_blank" rel="noreferrer" style={{ color: '#94a3b8' }}><Github size={18} /></a>
        </div>
      </footer>

    </div>
  );
}