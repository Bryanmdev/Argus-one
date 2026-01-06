import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Lock, FileText, Wallet, Shield, ArrowRight, ShieldCheck, Activity } from 'lucide-react';
import PasswordVault from './PasswordVault';
import SecureNotes from './SecureNotes';
import ThreatScanner from './ThreatScanner'; 
import DigitalWallet from './DigitalWallet';
import SplashScreen from './SplashScreen';
import '../App.css';

// --- COMPONENTE DE CARD DE FERRAMENTA ---
const ToolCard = ({ icon: Icon, title, desc, onClick, glowColor }: any) => (
  <div
    onClick={onClick}
    className="menu-card"
    style={{ ['--hover-color' as any]: glowColor }}
  >
    <div className="icon-wrapper" style={{ backgroundColor: `${glowColor}15`, color: glowColor }}>
      <Icon size={32} strokeWidth={1.5} />
    </div>
    <div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
    <div className="card-arrow" style={{ color: glowColor }}>
      <ArrowRight size={24} />
    </div>
  </div>
);

// --- COMPONENTE DE STATUS (NOVO) ---
const StatusBadge = ({ count, label, color }: any) => (
    <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '15px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)', flex: 1 }}>
        <span style={{ fontSize: '1.5rem', fontWeight: '700', color: color, fontFamily: 'var(--font-display)' }}>{count}</span>
        <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginTop: 5 }}>{label}</span>
    </div>
);

export default function Dashboard() {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  
  // Estados para as estatísticas
  const [stats, setStats] = useState({ vault: 0, wallet: 0, notes: 0 });
  const [securityScore, setSecurityScore] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  // Busca dados reais para o dashboard ficar vivo
  useEffect(() => {
    const fetchStats = async () => {
        const { count: vaultCount } = await supabase.from('vault_items').select('*', { count: 'exact', head: true });
        const { count: walletCount } = await supabase.from('wallet_items').select('*', { count: 'exact', head: true });
        const { count: notesCount } = await supabase.from('secure_notes').select('*', { count: 'exact', head: true });

        const v = vaultCount || 0;
        const w = walletCount || 0;
        const n = notesCount || 0;

        setStats({ vault: v, wallet: w, notes: n });

        // Cálculo simples de Score (Gamification)
        // Cada item adiciona pontos até o máximo de 100
        let score = 0;
        if (v > 0) score += 20; // Começou a usar senhas
        if (v > 5) score += 20; // Usa bastante
        if (w > 0) score += 30; // Protege cartões
        if (n > 0) score += 30; // Protege notas
        
        // Animação do Score
        let current = 0;
        const timer = setInterval(() => {
            current += 2;
            if (current >= score) {
                current = score;
                clearInterval(timer);
            }
            setSecurityScore(current);
        }, 20);
        
        setLoadingStats(false);
    };

    if (!showSplash) fetchStats();
  }, [showSplash]);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // --- ROTEAMENTO INTERNO ---
  if (activeTool === 'vault') return <PasswordVault onBack={() => setActiveTool(null)} />;
  if (activeTool === 'notes') return <SecureNotes onBack={() => setActiveTool(null)} />;
  if (activeTool === 'scanner') return <ThreatScanner onBack={() => setActiveTool(null)} />;
  if (activeTool === 'wallet') return <DigitalWallet onBack={() => setActiveTool(null)} />

  return (
    <div style={{ width: '100%', paddingBottom: '40px' }}>

      {/* --- HEADER DO DASHBOARD --- */}
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 className="dashboard-title">Visão Geral</h1>
        <p className="dashboard-subtitle">Sua central de inteligência e proteção.</p>

        {/* --- NOVO: CARD DE SAÚDE DIGITAL --- */}
        <div className="card" style={{ background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)', border: '1px solid rgba(139, 92, 246, 0.2)', padding: '30px', maxWidth: '800px', margin: '0 auto 40px auto' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}>
                    {/* Círculo de Fundo */}
                    <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                        {/* Círculo de Progresso */}
                        <circle 
                            cx="50" cy="50" r="45" fill="none" stroke={securityScore > 70 ? '#10b981' : securityScore > 40 ? '#f59e0b' : '#ef4444'} strokeWidth="8" 
                            strokeDasharray="283" 
                            strokeDashoffset={283 - (283 * securityScore) / 100} 
                            style={{ transition: 'stroke-dashoffset 1s ease' }}
                        />
                    </svg>
                    <ShieldCheck size={32} color={securityScore > 70 ? '#10b981' : securityScore > 40 ? '#f59e0b' : '#ef4444'} style={{ position: 'absolute' }} />
                </div>
                <h2 style={{ fontFamily: 'var(--font-display)', margin: 0, fontSize: '2rem' }}>{securityScore}%</h2>
                <p style={{ color: '#94a3b8', margin: '5px 0 0 0' }}>Nível de Proteção</p>
            </div>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap', width: '100%' }}>
                <StatusBadge count={loadingStats ? '-' : stats.vault} label="Senhas" color="#8b5cf6" />
                <StatusBadge count={loadingStats ? '-' : stats.wallet} label="Cartões" color="#f59e0b" />
                <StatusBadge count={loadingStats ? '-' : stats.notes} label="Notas" color="#10b981" />
            </div>

            <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.9rem', color: '#64748b' }}>
                <Activity size={16} color="#10b981" /> Sistema Operacional: <span style={{ color: '#10b981' }}>Online & Seguro</span>
            </div>
        </div>
      </div>

      {/* --- GRID DE FERRAMENTAS --- */}
      <h3 style={{ color: '#94a3b8', marginBottom: '20px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', paddingLeft: '5px' }}>Ferramentas</h3>
      
      <div className="dashboard-grid">
        <ToolCard
          icon={Lock}
          title="Cofre de Senhas"
          desc="Gerenciamento criptografado."
          glowColor="#8b5cf6"
          onClick={() => setActiveTool('vault')}
        />

        <ToolCard
          icon={Wallet}
          title="Carteira Digital"
          desc="Seus cartões protegidos."
          glowColor="#f59e0b"
          onClick={() => setActiveTool('wallet')} 
        />

        <ToolCard
          icon={Shield}
          title="Scanner de Ameaças"
          desc="Verificador de URLs e Phishing."
          glowColor="#ef4444"
          onClick={() => setActiveTool('scanner')} 
        />

        <ToolCard
          icon={FileText}
          title="Notas Seguras"
          desc="Segredos e chaves privadas."
          glowColor="#10b981"
          onClick={() => setActiveTool('notes')}
        />
      </div>
    </div>
  );
}