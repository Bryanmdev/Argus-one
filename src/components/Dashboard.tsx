import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { decryptData } from '../utils/security';
import { Lock, FileText, Wallet, Shield, ArrowRight, ShieldCheck, Download, Loader2, AlertTriangle, ArrowLeft, BarChart3, AlertOctagon, CheckCircle2, CreditCard, StickyNote, Radar, Smartphone, Eye, Settings as SettingsIcon, GraduationCap } from 'lucide-react';
import PasswordVault from './PasswordVault';
import SecureNotes from './SecureNotes';
import ThreatScanner from './ThreatScanner';
import DigitalWallet from './DigitalWallet';
import LeakRadar from './LeakRadar';
import Authenticator from './Authenticator';
import PrivacyInspector from './PrivacyInspector';
import EduQuiz from './EduQuiz';
import Settings from './Settings';
import SplashScreen from './SplashScreen';
import '../App.css';

interface AuditData {
  date: string; 
  totalVaultItems: number; 
  totalCards: number; 
  totalDocuments: number; 
  totalNotes: number; 
  totalTokens: number;
  weakCount: number; 
  reusedCount: number; 
  totalCompromised: number;
  details: { 
      weakSites: string[]; 
      reusedGroups: { passwordHash: string, sites: string[] }[]; 
  }; 
  score: number;
}

const AuditInsights = ({ data, onBack, onDownload }: { data: AuditData, onBack: () => void, onDownload: () => void }) => {
  return (
    <div className="main-content" style={{ paddingBottom: '40px', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
            <h2 style={{ margin: 0, fontSize: '1.8rem', fontFamily: 'var(--font-display)', color: 'var(--text-color)' }}>Relatório de <span style={{ color: data.score > 70 ? '#10b981' : '#ef4444' }}>Segurança</span></h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Gerado em: {data.date}</p>
        </div>
        <button onClick={onBack} style={{ width: 'auto', flex: 'none', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '8px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <ArrowLeft size={16} /> Voltar
        </button>
      </div>

      <div className="card" style={{ textAlign: 'center', padding: '40px', marginBottom: '30px', background: `linear-gradient(180deg, ${data.score > 70 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'} 0%, rgba(15, 23, 42, 0) 100%)`, border: `1px solid ${data.score > 70 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}` }}>
        <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="120" height="120" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
              <circle cx="50" cy="50" r="45" fill="none" stroke={data.score > 70 ? '#10b981' : data.score > 40 ? '#f59e0b' : '#ef4444'} strokeWidth="8" strokeDasharray="283" strokeDashoffset={283 - (283 * data.score) / 100} style={{ transition: 'stroke-dashoffset 1s ease' }} />
          </svg>
          <div style={{ position: 'absolute', fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-color)' }}>{data.score}</div>
        </div>
        <h3 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--text-color)' }}>{data.score > 80 ? 'Excelente!' : data.score > 50 ? 'Razoável' : 'Atenção Necessária'}</h3>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '10px auto 20px' }}>
            {data.score === 100 ? 'Seu cofre digital está blindado.' : 'Encontramos vulnerabilidades que precisam da sua atenção.'}
        </p>
        <button onClick={onDownload} className="btn-primary" style={{ width: 'auto', margin: '0 auto', display: 'flex', gap: 8, fontSize: '0.9rem' }}>
            <Download size={18} /> Baixar Relatório (TXT)
        </button>
      </div>

      <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>Inventário Digital</h3>
      <div className="dashboard-grid" style={{ marginBottom: '30px', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))' }}>
        <div className="card" style={{ textAlign: 'center', padding: '20px 10px' }}>
            <Lock size={24} color="#8b5cf6" style={{ marginBottom: 10 }} />
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-color)' }}>{data.totalVaultItems}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Senhas</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '20px 10px' }}>
            <Smartphone size={24} color="#3b82f6" style={{ marginBottom: 10 }} />
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-color)' }}>{data.totalTokens}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>2FA Tokens</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '20px 10px' }}>
            <CreditCard size={24} color="#f59e0b" style={{ marginBottom: 10 }} />
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-color)' }}>{data.totalCards}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Cartões</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '20px 10px' }}>
            <StickyNote size={24} color="#10b981" style={{ marginBottom: 10 }} />
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-color)' }}>{data.totalNotes}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Notas</div>
        </div>
      </div>

      <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>Análise de Risco</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
        <div className="card" style={{ borderColor: data.totalTokens === 0 ? '#ef4444' : 'var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 15 }}>
                <div style={{ background: data.totalTokens === 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', padding: 8, borderRadius: '50%' }}>
                   {data.totalTokens === 0 ? <AlertTriangle size={20} color="#ef4444" /> : <CheckCircle2 size={20} color="#10b981" />}
                </div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-color)' }}>Autenticação em 2 Etapas</h3>
            </div>
            {data.totalTokens === 0 ? (
                <p style={{ fontSize: '0.9rem', color: '#fca5a5', marginBottom: '5px' }}>
                    <strong>Crítico:</strong> Você não configurou nenhum token 2FA. Se sua senha vazar, sua conta estará exposta.
                </p>
            ) : (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Você tem {data.totalTokens} contas protegidas com 2FA. Excelente!</p>
            )}
        </div>

        <div className="card" style={{ borderColor: data.weakCount > 0 ? '#f59e0b' : 'var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 15 }}>
                <div style={{ background: data.weakCount > 0 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)', padding: 8, borderRadius: '50%' }}>
                   {data.weakCount > 0 ? <AlertOctagon size={20} color="#f59e0b" /> : <CheckCircle2 size={20} color="#10b981" />}
                </div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-color)' }}>Senhas Fracas ({data.weakCount})</h3>
            </div>
            {data.weakCount > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {data.details.weakSites.map(site => (
                        <span key={site} style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', color: '#fdba74', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem' }}>
                            {site}
                        </span>
                    ))}
                </div>
            ) : (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Nenhuma senha fraca detectada.</p>
            )}
        </div>

        <div className="card" style={{ borderColor: data.reusedCount > 0 ? '#ef4444' : 'var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 15 }}>
                 <div style={{ background: data.reusedCount > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', padding: 8, borderRadius: '50%' }}>
                   {data.reusedCount > 0 ? <AlertTriangle size={20} color="#ef4444" /> : <CheckCircle2 size={20} color="#10b981" />}
                </div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-color)' }}>Reutilização de Senhas ({data.reusedCount} grupos)</h3>
            </div>
            {data.reusedCount > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {data.details.reusedGroups.map((group, idx) => (
                        <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '6px', borderLeft: '3px solid #ef4444' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase' }}>Grupo de Risco #{idx + 1}</div>
                            <div style={{ color: 'var(--text-color)', fontSize: '0.9rem' }}>{group.sites.join(', ')}</div>
                        </div>
                    ))}
                </div>
            ) : (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Todas as suas senhas são únicas.</p>
            )}
        </div>
      </div>
    </div>
  );
};

const ToolCard = ({ icon: Icon, title, desc, onClick, glowColor }: any) => (
  <div onClick={onClick} className="menu-card" style={{ ['--hover-color' as any]: glowColor }}>
    <div className="icon-wrapper" style={{ backgroundColor: `${glowColor}15`, color: glowColor }}>
      <Icon size={32} strokeWidth={1.5} />
    </div>
    <div><h3>{title}</h3><p>{desc}</p></div>
    <div className="card-arrow" style={{ color: glowColor }}><ArrowRight size={24} /></div>
  </div>
);

const StatusBadge = ({ count, label, color }: any) => (
  <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '15px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)', flex: 1, minWidth: '80px' }}>
    <span style={{ fontSize: '1.5rem', fontWeight: '700', color: color, fontFamily: 'var(--font-display)' }}>{count}</span>
    <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginTop: 5 }}>{label}</span>
  </div>
);

const PinModal = ({ isOpen, onClose, onConfirm, loading }: any) => {
  const [pin, setPin] = useState('');
  if (!isOpen) return null;
  return (
    <div onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div onClick={(e) => e.stopPropagation()} className="card" style={{ maxWidth: '350px', width: '90%', padding: '40px 25px 30px 25px', display: 'block' }}>
        <div style={{ textAlign: 'center', marginBottom: 25 }}><div style={{ background: 'rgba(139, 92, 246, 0.15)', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', border: '1px solid rgba(139, 92, 246, 0.3)' }}><ShieldCheck size={32} color="#8b5cf6" /></div><h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--text-color)' }}>Autorizar Auditoria</h3><p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 8 }}>Digite seu PIN Mestre para acessar o painel.</p></div>
        <form onSubmit={(e) => { e.preventDefault(); onConfirm(pin); }}><input type="password" inputMode="numeric" placeholder="PIN Mestre" value={pin} onChange={e => setPin(e.target.value)} autoFocus style={{ textAlign: 'center', letterSpacing: '6px', fontSize: '1.4rem', marginBottom: 20, fontWeight: 'bold' }} maxLength={8} /><button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>{loading ? <Loader2 className="spin-animation" size={20} /> : 'Acessar Relatório'}</button></form>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [stats, setStats] = useState({ vault: 0, wallet: 0, notes: 0 });
  const [securityScore, setSecurityScore] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [auditData, setAuditData] = useState<AuditData | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const { count: vaultCount } = await supabase.from('vault_items').select('*', { count: 'exact', head: true }).neq('site_name', 'SYSTEM_VERIFIER');
      const { count: walletCount } = await supabase.from('wallet_items').select('*', { count: 'exact', head: true }).neq('type', 'verifier');
      const { count: notesCount } = await supabase.from('secure_notes').select('*', { count: 'exact', head: true });
      const v = vaultCount || 0; const w = walletCount || 0; const n = notesCount || 0;
      setStats({ vault: v, wallet: w, notes: n });
      let score = 0; if (v > 0) score += 20; if (v > 5) score += 20; if (w > 0) score += 30; if (n > 0) score += 30;
      let current = 0; const timer = setInterval(() => { current += 2; if (current >= score) { current = score; clearInterval(timer); } setSecurityScore(current); }, 20);
      setLoadingStats(false);
    };
    if (!showSplash) fetchStats();
  }, [showSplash]);

  const handleRunAudit = async (masterPin: string) => {
    if (!masterPin) return;
    setLoadingAction(true);
    try {
      const { data: vaultItems } = await supabase.from('vault_items').select('*');
      const { data: walletItems } = await supabase.from('wallet_items').select('*');
      const { data: notesItems } = await supabase.from('secure_notes').select('*');
      const { data: tokenItems } = await supabase.from('auth_tokens').select('*');

      if (!vaultItems || vaultItems.length === 0) throw new Error("Cofre vazio.");
      const verifierItem = vaultItems.find(i => i.site_name === 'SYSTEM_VERIFIER');
      let isPinValid = false;
      if (verifierItem) { if (decryptData(verifierItem.password_encrypted, masterPin) === 'CHECK') isPinValid = true; }
      else { if (decryptData(vaultItems[0].password_encrypted, masterPin)) isPinValid = true; }
      if (!isPinValid) { alert("❌ PIN Incorreto."); setLoadingAction(false); return; }

      let weakCount = 0; let passwordMap: Record<string, string[]> = {};
      const realVaultItems = vaultItems.filter(i => i.site_name !== 'SYSTEM_VERIFIER');
      realVaultItems.forEach(item => {
        const pass = decryptData(item.password_encrypted, masterPin);
        if (pass) { if (pass.length < 8) weakCount++; if (!passwordMap[pass]) passwordMap[pass] = []; passwordMap[pass].push(item.site_name); }
      });
      let reusedGroups: { passwordHash: string, sites: string[] }[] = [];
      let reusedCount = 0; 
      Object.entries(passwordMap).forEach(([pass, sites]) => { if (sites.length > 1) { reusedCount++; reusedGroups.push({ passwordHash: pass.length + 'x', sites }); } });
      const realWalletItems = walletItems ? walletItems.filter(i => i.type !== 'verifier') : [];
      const cardsCount = realWalletItems.filter(i => i.type === 'card').length; const docsCount = realWalletItems.filter(i => i.type === 'document').length; const notesCount = notesItems ? notesItems.length : 0;
      const tokensCount = tokenItems ? tokenItems.length : 0;

      let auditScore = 100; 
      auditScore -= (weakCount * 10); 
      auditScore -= (reusedCount * 15); 
      if (tokensCount === 0) auditScore -= 20;
      if (auditScore < 0) auditScore = 0;
      
      setAuditData({ 
          date: new Date().toLocaleString('pt-BR'), 
          totalVaultItems: realVaultItems.length, 
          totalCards: cardsCount, 
          totalDocuments: docsCount, 
          totalNotes: notesCount, 
          totalTokens: tokensCount, 
          weakCount, reusedCount, totalCompromised: 0, 
          score: auditScore, 
          details: { weakSites: realVaultItems.filter(i => { const p = decryptData(i.password_encrypted, masterPin); return p && p.length < 8; }).map(i => i.site_name), reusedGroups } 
      });
      setActiveTool('audit_report'); setShowAuthModal(false);
    } catch (error) { console.error(error); alert("Erro na auditoria."); } finally { setLoadingAction(false); }
  };

  const handleDownloadTxt = () => {
    if (!auditData) return;
    const content = `RELATÓRIO DE AUDITORIA ARGUS ONE\nData: ${auditData.date}\nScore: ${auditData.score}/100\n\n[ INVENTÁRIO ]\n- Senhas: ${auditData.totalVaultItems}\n- Cartões: ${auditData.totalCards}\n- Docs: ${auditData.totalDocuments}\n- Notas: ${auditData.totalNotes}\n- Tokens 2FA: ${auditData.totalTokens}\n\n[ VULNERABILIDADES ]\n- Senhas Fracas: ${auditData.weakCount}\n- Senhas Repetidas: ${auditData.reusedCount}\n- 2FA Configurado: ${auditData.totalTokens > 0 ? 'SIM' : 'NÃO (Crítico)'}\n\nGerado localmente.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `Argus_Audit_${Date.now()}.txt`; document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const handleEmergencyWipe = async (masterPin: string) => {
    setLoadingAction(true);
    try {
      const { data: items } = await supabase.from('vault_items').select('*');
      if (items && items.length > 0) {
        const verifierItem = items.find(i => i.site_name === 'SYSTEM_VERIFIER');
        if (verifierItem) { if (decryptData(verifierItem.password_encrypted, masterPin) !== 'CHECK') throw new Error("PIN Inválido"); }
        else { if (!decryptData(items[0].password_encrypted, masterPin)) throw new Error("PIN Inválido"); }
      }
      await supabase.from('vault_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('wallet_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('secure_notes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('auth_tokens').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      localStorage.clear(); await supabase.auth.signOut(); alert("⚠️ DADOS DESTRUÍDOS."); window.location.reload();
    } catch (e) { alert("PIN Incorreto."); } finally { setLoadingAction(false); }
  };

  if (showSplash) return <SplashScreen onFinish={() => setShowSplash(false)} />;

  if (activeTool === 'audit_report' && auditData) return <AuditInsights data={auditData} onBack={() => setActiveTool(null)} onDownload={handleDownloadTxt} />;
  if (activeTool === 'leak_radar') return <LeakRadar onBack={() => setActiveTool(null)} />;
  if (activeTool === 'authenticator') return <Authenticator onBack={() => setActiveTool(null)} />;
  if (activeTool === 'privacy_inspector') return <PrivacyInspector onBack={() => setActiveTool(null)} />;
  if (activeTool === 'edu_quiz') return <EduQuiz onBack={() => setActiveTool(null)} />; 
  if (activeTool === 'settings') { return ( <Settings onBack={() => setActiveTool(null)} onPanicExecute={handleEmergencyWipe}/> ); }
  if (activeTool === 'vault') return <PasswordVault onBack={() => setActiveTool(null)} />;
  if (activeTool === 'notes') return <SecureNotes onBack={() => setActiveTool(null)} />;
  if (activeTool === 'scanner') return <ThreatScanner onBack={() => setActiveTool(null)} />;
  if (activeTool === 'wallet') return <DigitalWallet onBack={() => setActiveTool(null)} />;

  return (
    <div className="main-content" style={{ paddingBottom: '60px' }}>
      <PinModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onConfirm={handleRunAudit} loading={loadingAction} />
      
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1 className="dashboard-title">Visão Geral</h1>
        <div className="card" style={{ background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)', border: '1px solid rgba(139, 92, 246, 0.2)', padding: '25px', maxWidth: '800px', margin: '20px auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', margin: 0, fontSize: '2.5rem', color: securityScore > 70 ? '#10b981' : securityScore > 40 ? '#f59e0b' : '#ef4444' }}>{securityScore}%</h2>
            <p style={{ color: 'var(--text-secondary)', margin: '0', fontSize: '0.9rem' }}>Nível de Proteção</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', width: '100%', marginBottom: '20px' }}>
            <StatusBadge count={loadingStats ? '-' : stats.vault} label="Senhas" color="#8b5cf6" />
            <StatusBadge count={loadingStats ? '-' : stats.wallet} label="Cartões" color="#f59e0b" />
            <StatusBadge count={loadingStats ? '-' : stats.notes} label="Notas" color="#10b981" />
          </div>
          <button onClick={() => setShowAuthModal(true)} style={{ width: '100%', padding: '12px', background: 'rgba(139, 92, 246, 0.1)', border: '1px dashed rgba(139, 92, 246, 0.4)', color: '#a78bfa', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
            <BarChart3 size={18} /> Relatório de Auditoria
          </button>
        </div>
      </div>

      <h3 style={{ color: 'var(--text-secondary)', marginBottom: '15px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', paddingLeft: '5px' }}>Ferramentas</h3>
      <div className="dashboard-grid">
        <ToolCard icon={Lock} title="Cofre de Senhas" desc="Acesso criptografado." glowColor="#8b5cf6" onClick={() => setActiveTool('vault')} />
        <ToolCard icon={Wallet} title="Carteira Digital" desc="Documentos protegidos." glowColor="#f59e0b" onClick={() => setActiveTool('wallet')} />
        <ToolCard icon={Radar} title="Leak Radar" desc="Verificador de vazamentos." glowColor="#ef4444" onClick={() => setActiveTool('leak_radar')} />
        <ToolCard icon={Smartphone} title="2FA Auth" desc="Gerador de Códigos." glowColor="#3b82f6" onClick={() => setActiveTool('authenticator')} />
        <ToolCard icon={Eye} title="Privacy Inspector" desc="Espelho digital." glowColor="#0ea5e9" onClick={() => setActiveTool('privacy_inspector')} />
        <ToolCard icon={Shield} title="Scanner de Ameaças" desc="Verificador de URLs." glowColor="#ef4444" onClick={() => setActiveTool('scanner')} />
        <ToolCard icon={FileText} title="Notas Seguras" desc="Informações privadas." glowColor="#10b981" onClick={() => setActiveTool('notes')} />
      </div>

      <h3 style={{ color: 'var(--text-secondary)', marginBottom: '15px', marginTop: '30px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', paddingLeft: '5px' }}>Extras</h3>
      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        <ToolCard icon={GraduationCap} title="Academia Anti-Golpe" desc="Aprenda a identificar fraudes." glowColor="#f59e0b" onClick={() => setActiveTool('edu_quiz')} />
        <ToolCard icon={SettingsIcon} title="Configurações" desc="Backup e Protocolos." glowColor="#94a3b8" onClick={() => setActiveTool('settings')} />
      </div>
    </div>
  );
}