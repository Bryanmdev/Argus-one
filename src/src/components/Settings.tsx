import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { encryptData, decryptData } from '../utils/security';
import { ArrowLeft, Save, Download, Trash2, Key, Loader2, ShieldAlert, Sun, Moon, AlertTriangle } from 'lucide-react';
import '../App.css';

interface SettingsProps {
  onBack: () => void;
  onPanicExecute: (pin: string) => Promise<void>;
}

// ... (AuthModal permanece igual) ...
const AuthModal = ({ isOpen, onClose, onConfirm, title, message, isDestructive = false }: any) => {
    const [pin, setPin] = useState('');
    if (!isOpen) return null;
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
            <div className="card" style={{ maxWidth: '350px', width: '90%', borderColor: isDestructive ? '#ef4444' : 'var(--border)' }}>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <div style={{ background: isDestructive ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.1)', width: 60, height: 60, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                        {isDestructive ? <AlertTriangle size={30} color="#ef4444" /> : <Key size={30} color="#3b82f6" />}
                    </div>
                    <h3 style={{ margin: 0, color: isDestructive ? '#ef4444' : 'var(--text-color)' }}>{title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 10 }}>{message}</p>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); onConfirm(pin); setPin(''); }}>
                    <input type="password" inputMode="numeric" placeholder="Digite seu PIN" value={pin} onChange={e => setPin(e.target.value)} autoFocus style={{ textAlign: 'center', letterSpacing: '6px', fontSize: '1.4rem', marginBottom: 20, fontWeight: 'bold' }} maxLength={8}/>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button type="button" onClick={onClose} style={{ flex: 1, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer', borderRadius: '8px' }}>Cancelar</button>
                        <button type="submit" className="btn-primary" disabled={pin.length < 4} style={{ flex: 1, background: isDestructive ? '#ef4444' : 'var(--accent)', borderColor: isDestructive ? '#ef4444' : 'var(--accent)' }}>Confirmar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default function Settings({ onBack, onPanicExecute }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'danger'>('general');
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState('dark');

  // Modais
  const [showBackupAuth, setShowBackupAuth] = useState(false);
  const [showPanicAuth, setShowPanicAuth] = useState(false);

  // Troca de PIN
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');

  useEffect(() => {
      const savedTheme = localStorage.getItem('app_theme') || 'dark';
      setTheme(savedTheme);
      document.body.className = savedTheme;
  }, []);

  const toggleTheme = () => {
      const nextTheme = theme === 'dark' ? 'light' : 'dark';
      setTheme(nextTheme);
      localStorage.setItem('app_theme', nextTheme);
      document.body.className = nextTheme;
  };

  const handleChangePin = async (e: React.FormEvent) => {
      e.preventDefault();
      if (newPin.length < 4) { alert("O novo PIN deve ter pelo menos 4 dígitos."); return; }
      if (newPin !== confirmNewPin) { alert("A confirmação do PIN não confere."); return; }
      if (currentPin === newPin) { alert("O novo PIN é igual ao atual."); return; }

      setLoading(true);
      try {
          const { data: vaultItems } = await supabase.from('vault_items').select('*');
          if (!vaultItems) throw new Error("Erro de conexão.");

          const verifier = vaultItems.find(i => i.site_name === 'SYSTEM_VERIFIER');
          let testItem = verifier || vaultItems[0];
          
          if (testItem) {
              const testDecrypted = decryptData(testItem.password_encrypted || '', currentPin);
              if (!testDecrypted || (verifier && testDecrypted !== 'CHECK')) {
                  alert("PIN Atual Incorreto!");
                  setLoading(false);
                  return;
              }
          }

          for (const item of vaultItems) {
              const userDec = decryptData(item.username_encrypted || '', currentPin) || '';
              const passDec = decryptData(item.password_encrypted || '', currentPin) || '';
              
              await supabase.from('vault_items').update({
                  username_encrypted: encryptData(userDec, newPin),
                  password_encrypted: encryptData(passDec, newPin)
              }).eq('id', item.id);
          }
          
          alert("PIN alterado com sucesso!");
          setCurrentPin(''); setNewPin(''); setConfirmNewPin('');
      } catch (error) {
          console.error(error);
          alert("Erro ao alterar PIN.");
      } finally {
          setLoading(false);
      }
  };

  const handleBackup = async (pin: string) => {
      setShowBackupAuth(false);
      setLoading(true);
      try {
          const { data: check } = await supabase.from('vault_items').select('*').limit(1);
          if (check && check.length > 0) {
             if (!decryptData(check[0].password_encrypted || '', pin)) {
                 alert("PIN incorreto. Backup negado.");
                 setLoading(false);
                 return;
             }
          }

          const { data: vault } = await supabase.from('vault_items').select('*');
          const { data: wallet } = await supabase.from('wallet_items').select('*');
          const { data: notes } = await supabase.from('secure_notes').select('*');
          const { data: tokens } = await supabase.from('auth_tokens').select('*');

          const backup = { date: new Date().toISOString(), vault, wallet, notes, tokens };
          
          const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Argus_Backup_${Date.now()}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
      } catch (e) { alert("Erro ao gerar backup."); }
      finally { setLoading(false); }
  };

  return (
    <div className="container" style={{ paddingBottom: '40px' }}>
       
       <AuthModal isOpen={showBackupAuth} onClose={() => setShowBackupAuth(false)} onConfirm={handleBackup} title="Segurança do Backup" message="Digite seu PIN para autorizar o download dos seus dados." />
       <AuthModal isOpen={showPanicAuth} onClose={() => setShowPanicAuth(false)} onConfirm={(pin: string) => onPanicExecute(pin)} title="AUTODESTRUIÇÃO" message="Tem certeza? Isso apagará TUDO. Digite seu PIN para confirmar." isDestructive={true} />

       {/* HEADER */}
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div><h2 style={{ margin: 0, fontSize: '1.8rem', fontFamily: 'var(--font-display)', color: 'var(--text-color)' }}>Configurações</h2></div>
        <button onClick={onBack} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', width: 'auto', flex: 'none' }}>
            <ArrowLeft size={16} /> Voltar
        </button>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
          <button onClick={() => setActiveTab('general')} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: activeTab === 'general' ? 'var(--primary-light)' : 'rgba(255,255,255,0.05)', color: activeTab === 'general' ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: 600 }}>Geral</button>
          <button onClick={() => setActiveTab('danger')} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: activeTab === 'danger' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)', color: activeTab === 'danger' ? '#ef4444' : 'var(--text-secondary)', fontWeight: 600 }}>Zona de Perigo</button>
      </div>

      {activeTab === 'general' ? (
          <div style={{ animation: 'fadeIn 0.3s' }}>
              
              {/* TEMA */}
              <div className="card" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                      <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.2rem' }}>{theme === 'light' ? <Sun size={20} color="#f59e0b" /> : <Moon size={20} color="#8b5cf6" />} Aparência</h3>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>Modo {theme === 'light' ? 'Claro' : 'Escuro'} ativo.</p>
                  </div>
                  <button onClick={toggleTheme} style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', padding: '10px', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-color)' }}>
                      Trocar Tema
                  </button>
              </div>

              {/* TROCAR PIN */}
              <div className="card" style={{ marginBottom: 20 }}>
                  <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.2rem' }}><Key size={20} color="#f59e0b" /> Alterar PIN Mestre</h3>
                  <form onSubmit={handleChangePin} style={{ display: 'grid', gap: 15, marginTop: 15 }}>
                      <input type="password" inputMode="numeric" placeholder="PIN Atual" value={currentPin} onChange={e => setCurrentPin(e.target.value)} maxLength={8} required />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <input type="password" inputMode="numeric" placeholder="Novo PIN" value={newPin} onChange={e => setNewPin(e.target.value)} maxLength={8} required />
                        <input type="password" inputMode="numeric" placeholder="Confirme o Novo PIN" value={confirmNewPin} onChange={e => setConfirmNewPin(e.target.value)} maxLength={8} required style={{ borderColor: (confirmNewPin && newPin !== confirmNewPin) ? '#ef4444' : '' }} />
                      </div>
                      <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>{loading ? <Loader2 className="spin-animation" /> : <><Save size={18} /> Atualizar PIN</>}</button>
                  </form>
              </div>

              {/* BACKUP */}
              <div className="card">
                  <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.2rem' }}><Download size={20} color="#3b82f6" /> Backup de Dados</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 20 }}>Baixe um arquivo JSON criptografado. Requer PIN.</p>
                  <button onClick={() => setShowBackupAuth(true)} style={{ width: '100%', padding: '12px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#3b82f6', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <Download size={18} /> Baixar Backup Seguro
                  </button>
              </div>

          </div>
      ) : (
          <div style={{ animation: 'fadeIn 0.3s' }}>
              <div className="card" style={{ borderColor: '#ef4444', background: 'rgba(239, 68, 68, 0.05)' }}>
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                      <ShieldAlert size={48} color="#ef4444" style={{ marginBottom: 15 }} />
                      <h3 style={{ color: '#ef4444', fontSize: '1.5rem', margin: '0 0 10px 0' }}>Protocolo de Emergência</h3>
                      <p style={{ color: '#fca5a5', maxWidth: '400px', margin: '0 auto 30px' }}>Esta ação destrói permanentemente todos os dados armazenados. Use apenas em situações extremas.</p>
                      <button onClick={() => setShowPanicAuth(true)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '15px 30px', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, margin: '0 auto' }}><Trash2 size={20} /> INICIAR DESTRUIÇÃO</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}