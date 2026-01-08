import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { encryptLight, decryptLight } from '../utils/security';
import { generateTOTP, getRemainingSeconds } from '../utils/totp';
import { ArrowLeft, Plus, Trash2, Loader2, Copy, ShieldCheck, Smartphone } from 'lucide-react';
import '../App.css';

interface TokenItem {
  id: string;
  service_name: string;
  issuer: string;
  secret_encrypted: string;
}

interface AuthenticatorProps {
  onBack: () => void;
}

export default function Authenticator({ onBack }: AuthenticatorProps) {
  const [tokens, setTokens] = useState<TokenItem[]>([]);
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState(30);
  const [loading, setLoading] = useState(true);
  
  // Auth State
  const [pin, setPin] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  
  // Add Token State
  const [showAdd, setShowAdd] = useState(false);
  const [newService, setNewService] = useState('');
  const [newSecret, setNewSecret] = useState('');

  const handleUnlock = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      if (pin.length >= 4) {
          setIsUnlocked(true);
          fetchTokens();
      } else {
          alert("PIN Inválido");
      }
      setLoading(false);
  };

  const fetchTokens = async () => {
      const { data } = await supabase.from('auth_tokens').select('*');
      if (data) {
          setTokens(data);
          updateCodes(data);
      }
  };

  const updateCodes = (currentTokens: TokenItem[]) => {
      const newCodes: Record<string, string> = {};
      currentTokens.forEach(t => {
          try {
              const secret = decryptLight(t.secret_encrypted, pin);
              if (secret) {
                  newCodes[t.id] = generateTOTP(secret);
              }
          } catch (e) {
              console.error("Erro ao decifrar token", t.service_name);
          }
      });
      setCodes(newCodes);
  };

  useEffect(() => {
      if (!isUnlocked) return;
      const timer = setInterval(() => {
          const seconds = getRemainingSeconds();
          setProgress(seconds);
          if (seconds === 30 || seconds === 29) {
              updateCodes(tokens);
          }
      }, 1000);
      return () => clearInterval(timer);
  }, [isUnlocked, tokens]);

  const handleAddToken = async (e: React.FormEvent) => {
      e.preventDefault();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const cleanSecret = newSecret.replace(/\s/g, '').toUpperCase();
      if (cleanSecret.length < 16) {
          alert("A chave secreta parece muito curta.");
          return;
      }

      const encrypted = encryptLight(cleanSecret, pin);
      await supabase.from('auth_tokens').insert({
          user_id: user.id,
          service_name: newService,
          issuer: newService, 
          secret_encrypted: encrypted
      });

      setNewService('');
      setNewSecret('');
      setShowAdd(false);
      fetchTokens();
  };

  const handleDelete = async (id: string) => {
      if(confirm("Remover este autenticador?")) {
          await supabase.from('auth_tokens').delete().eq('id', id);
          fetchTokens();
      }
  };

  if (!isUnlocked) {
    return (
      <div className="container" style={{paddingTop: '50px', textAlign: 'center'}}>
         <button onClick={onBack} style={{background: 'transparent', border: 'none', color: 'var(--text-secondary)', display: 'flex', gap: 5, alignItems: 'center', marginBottom: 20, cursor: 'pointer'}}><ArrowLeft size={18}/> Voltar</button>
         <div className="card" style={{maxWidth: '400px', margin: '0 auto', padding: '40px 20px'}}>
            <div style={{display: 'flex', justifyContent: 'center', marginBottom: 20}}>
                <div style={{background: 'rgba(59, 130, 246, 0.1)', padding: 20, borderRadius: '50%'}}><Smartphone size={40} color="#3b82f6" /></div>
            </div>
            <h2 style={{fontFamily: 'var(--font-display)', marginBottom: 10, color: 'var(--text-color)'}}>Argus Authenticator</h2>
            <p style={{color: 'var(--text-secondary)', marginBottom: 20}}>Digite seu PIN Global para acessar seus códigos 2FA.</p>
            <form onSubmit={handleUnlock}>
              <input type="password" inputMode="numeric" placeholder="PIN" value={pin} onChange={e => setPin(e.target.value)} style={{textAlign: 'center', letterSpacing: 4}} required maxLength={8}/>
              <button className="btn-primary" style={{width: '100%', marginTop: 15}} disabled={loading && pin.length < 4}>
                  {loading && pin.length > 0 ? <Loader2 className="spin-animation"/> : 'Desbloquear'}
              </button>
            </form>
         </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', paddingBottom: '60px' }}>
      
      {/* HEADER COM BOTÕES CORRIGIDOS (PEQUENOS) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
            <h2 style={{ margin: 0, fontSize: '1.8rem', fontFamily: 'var(--font-display)', color: 'var(--text-color)' }}>2FA <span style={{ color: '#3b82f6' }}>Tokens</span></h2>
        </div>
        <div style={{display: 'flex', gap: 10}}>
            <button 
                onClick={onBack} 
                style={{
                    width: 'auto', flex: 'none',
                    background: 'transparent', border: '1px solid var(--border)', 
                    color: 'var(--text-secondary)', padding: '8px 12px', 
                    borderRadius: '8px', display: 'flex', alignItems: 'center', 
                    gap: '6px', fontSize: '0.9rem', cursor: 'pointer'
                }}
            >
                <ArrowLeft size={16}/> Voltar
            </button>
            
            <button 
                onClick={() => setShowAdd(!showAdd)} 
                className="btn-primary" 
                style={{
                    width: 'auto', flex: 'none',
                    padding: '8px 16px', background: '#3b82f6', 
                    borderColor: '#3b82f6', display: 'flex', alignItems: 'center', gap: 6
                }}
            >
                <Plus size={18}/> {showAdd ? 'Fechar' : 'Novo'}
            </button>
        </div>
      </div>

      {showAdd && (
          <div className="card" style={{ marginBottom: 30, border: '1px solid #3b82f6', animation: 'fadeIn 0.3s' }}>
              <h3 style={{ marginTop: 0, color: 'var(--text-color)' }}>Adicionar Novo Serviço</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Insira a chave secreta fornecida pelo serviço (Ex: Google, Facebook).</p>
              <form onSubmit={handleAddToken}>
                  <input placeholder="Nome do Serviço (ex: Gmail Principal)" value={newService} onChange={e => setNewService(e.target.value)} required />
                  <input placeholder="Chave Secreta (ex: JBSWY3DPEHPK3PXP)" value={newSecret} onChange={e => setNewSecret(e.target.value)} required style={{ fontFamily: 'monospace', textTransform: 'uppercase' }} />
                  <button type="submit" className="btn-primary" style={{ background: '#3b82f6' }}>Salvar Token</button>
              </form>
          </div>
      )}

      {tokens.length === 0 && !showAdd && (
          <div style={{ textAlign: 'center', padding: '50px', border: '2px dashed var(--border)', borderRadius: '16px', color: 'var(--text-secondary)' }}>
              <Smartphone size={48} style={{ marginBottom: 15, opacity: 0.5 }} />
              <p>Nenhum autenticador configurado.</p>
              <button onClick={() => setShowAdd(true)} style={{ background: 'transparent', border: 'none', color: '#3b82f6', fontWeight: 'bold', cursor: 'pointer' }}>+ Adicionar o primeiro</button>
          </div>
      )}

      <div className="vault-grid">
          {tokens.map(token => (
              <div key={token.id} className="menu-card" style={{ cursor: 'default', flexDirection: 'column', alignItems: 'flex-start', gap: 15, ['--hover-color' as any]: '#3b82f6', minHeight: 'auto' }}>
                  
                  {/* CABEÇALHO */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <ShieldCheck size={20} color="#3b82f6" />
                          <span style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-color)' }}>{token.service_name}</span>
                      </div>
                      {/* Timer Circular */}
                      <div style={{ position: 'relative', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                           <svg width="24" height="24" viewBox="0 0 36 36">
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--border)" strokeWidth="4" />
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={progress < 5 ? '#ef4444' : '#3b82f6'} strokeWidth="4" strokeDasharray={`${(progress / 30) * 100}, 100`} style={{ transition: 'stroke-dasharray 1s linear' }} />
                           </svg>
                           <span style={{ position: 'absolute', fontSize: '0.6rem', fontWeight: 'bold', color: progress < 5 ? '#ef4444' : 'var(--text-secondary)' }}>{progress}</span>
                      </div>
                  </div>

                  {/* CORREÇÃO DO LAYOUT: FLEXBOX PARA EVITAR SOBREPOSIÇÃO */}
                  <div style={{ width: '100%', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', alignItems: 'stretch', overflow: 'hidden' }}>
                      
                      {/* Área do Código (Expansível) */}
                      <div style={{ flex: 1, padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                           <div style={{ fontSize: '1.8rem', fontFamily: 'monospace', letterSpacing: '3px', fontWeight: 700, color: progress < 5 ? '#ef4444' : 'var(--text-color)', transition: 'color 0.3s', whiteSpace: 'nowrap' }}>
                                {codes[token.id] ? codes[token.id].replace(/(\d{3})(\d{3})/, '$1 $2') : <Loader2 className="spin-animation" size={24} />}
                           </div>
                      </div>

                      {/* Área do Botão (Fixa e Separada) */}
                      <button 
                        onClick={() => { navigator.clipboard.writeText(codes[token.id]); alert('Copiado!'); }}
                        style={{ width: '60px', flex: 'none', background: 'rgba(255,255,255,0.03)', border: 'none', borderLeft: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                        onMouseEnter={(e) => {e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'var(--text-color)'}}
                        onMouseLeave={(e) => {e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = 'var(--text-secondary)'}}
                        title="Copiar código"
                      >
                          <Copy size={20} />
                      </button>
                  </div>

                  {/* BOTÃO REMOVER */}
                  <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
                      <button onClick={() => handleDelete(token.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', padding: 5 }}>
                          <Trash2 size={14} /> Remover
                      </button>
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
}