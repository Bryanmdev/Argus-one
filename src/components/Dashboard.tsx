import { useState } from 'react';
import { Lock, FileText, Wallet, Shield, ArrowRight, LayoutGrid } from 'lucide-react';
import PasswordVault from './PasswordVault';
import SecureNotes from './SecureNotes';
import ThreatScanner from './ThreatScanner'; // <--- IMPORTADO
import SplashScreen from './SplashScreen';
import '../App.css';
import DigitalWallet from './DigitalWallet';

const ToolCard = ({ icon: Icon, title, desc, onClick, glowColor }: any) => (
  <div
    onClick={onClick}
    className="menu-card"
    style={{ ['--hover-color' as any]: glowColor }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = `0 15px 30px -10px ${glowColor}40`;
      e.currentTarget.style.borderColor = glowColor;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = 'none';
      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
    }}
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

export default function Dashboard() {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // --- ROTEAMENTO ---
  if (activeTool === 'vault') return <PasswordVault onBack={() => setActiveTool(null)} />;
  if (activeTool === 'notes') return <SecureNotes onBack={() => setActiveTool(null)} />;
  if (activeTool === 'scanner') return <ThreatScanner onBack={() => setActiveTool(null)} />;
  if (activeTool === 'wallet') return <DigitalWallet onBack={() => setActiveTool(null)} />

  return (
    <div style={{ width: '100%', padding: '40px 0' }}>

      <div style={{ marginBottom: '50px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa',
          padding: '8px 16px', borderRadius: '30px', marginBottom: '20px',
          fontSize: '0.9rem', fontWeight: '600', border: '1px solid rgba(139, 92, 246, 0.2)'
        }}>
          <LayoutGrid size={16} /> Central de Segurança
        </div>

        <h1 className="dashboard-title">
          Bem-vindo ao Argus One
        </h1>
        <p className="dashboard-subtitle">
          Selecione uma ferramenta abaixo para gerenciar sua vida digital.
        </p>
      </div>

      <div className="dashboard-grid">
        <ToolCard
          icon={Lock}
          title="Senhas"
          desc="Gerenciador criptografado com auto-lock e análise de força."
          glowColor="#8b5cf6"
          onClick={() => setActiveTool('vault')}
        />

        <ToolCard
          icon={FileText}
          title="Notas Seguras"
          desc="Guarde chaves privadas, códigos e segredos."
          glowColor="#10b981"
          onClick={() => setActiveTool('notes')}
        />

        <ToolCard
          icon={Wallet}
          title="Carteira Digital"
          desc="Cartões de crédito e documentos importantes."
          glowColor="#f59e0b"
          onClick={() => setActiveTool('wallet')} // <--- ATIVADO!
        />

        <ToolCard
          icon={Shield}
          title="Scanner de Ameaças"
          desc="Verifique links suspeitos e números de telefone."
          glowColor="#ef4444"
          onClick={() => setActiveTool('scanner')} // <--- ATIVADO
        />
      </div>
    </div>
  );
}