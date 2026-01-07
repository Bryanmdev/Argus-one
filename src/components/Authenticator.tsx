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

  // --- 1. AUTENTICAÇÃO COM PIN GLOBAL ---
  const handleUnlock = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);

      // Validação simplificada (assume que se o PIN descriptografa, está ok)
      // Em produção, use a mesma validação robusta do Dashboard.tsx
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

  // --- 2. GERAÇÃO DE CÓDIGOS EM TEMPO REAL ---
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

  // Timer Effect (Roda a cada segundo)
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
          alert("A chave secreta parece muito curta. Geralmente tem 16 ou 32 caracteres.");
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
      if(confirm("Remover este autenticador? Você pode perder acesso à sua conta se não tiver backup.")) {
          await supabase.from('auth_tokens').delete().eq('id', id);
          fetchTokens();
      }
  };

  // --- TELA DE BLOQUEIO ---
  if (!isUnlocked) {
    return (
      <div className="container" style={{paddingTop: '50px', textAlign: 'center'}}>
         <button onClick={onBack} style={{background: 'transparent', border: 'none', color: '#94a3b8', display: 'flex', gap: 5, alignItems: 'center', marginBottom: 20, cursor: 'pointer'}}><ArrowLeft size={18}/> Voltar</button>
         <div className="card" style={{maxWidth: '400px', margin: '0 auto', padding: '40px 20px'}}>
            <div style={{display: 'flex', justifyContent: 'center', marginBottom: 20}}>
                <div style={{background: 'rgba(59, 130, 246, 0.1)', padding: 20, borderRadius: '50%'}}><Smartphone size={40} color="#3b82f6" /></div>
            </div>
            <h2 style={{fontFamily: 'var(--font-display)', marginBottom: 10}}>Argus Authenticator</h2>
            <p style={{color: '#94a3b8', marginBottom: 20}}>Digite seu PIN Global para acessar seus códigos 2FA.</p>
            <form onSubmit={handleUnlock}>
              <input type="password" inputMode="numeric" placeholder="PIN" value={pin} onChange={e => setPin(e.target.value)} style={{textAlign: 'center', letterSpacing: 4}} required maxLength={8}/>
              <button className="btn-primary" style={{width: '100%', marginTop: 15, background: '#3b82f6', borderColor: '#3b82f6'}} disabled={loading && pin.length < 4}>
                  {loading && pin.length > 0 ? <Loader2 className="spin-animation"/> : 'Desbloquear'}
              </button>
            </form>
         </div>
      </div>
    );
  }

  // --- TELA PRINCIPAL ---
  return (
    <div style={{ width: '100%', paddingBottom: '60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
            <h2 style={{ margin: 0, fontSize: '1.8rem', fontFamily: 'var(--font-display)' }}>2FA <span style={{ color: '#3b82f6' }}>Tokens</span></h2>
        </div>
        <div style={{display: 'flex', gap: 10}}>
            <button onClick={onBack} style={{background: 'transparent', border: '1px solid var(--border)', color: '#94a3b8', padding: '8px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', cursor: 'pointer'}}><ArrowLeft size={16}/> Voltar</button>
            <button onClick={() => setShowAdd(!showAdd)} className="btn-primary" style={{width: 'auto', padding: '8px 16px', background: '#3b82f6', borderColor: '#3b82f6'}}><Plus size={18}/> {showAdd ? 'Fechar' : 'Novo Token'}</button>
        </div>
      </div>

      {showAdd && (
          <div className="card" style={{ marginBottom: 30, border: '1px solid #3b82f6', animation: 'fadeIn 0.3s' }}>
              <h3 style={{ marginTop: 0 }}>Adicionar Novo Serviço</h3>
              <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                  No site que deseja proteger (Google, Facebook, etc), escolha "Configurar 2FA" e selecione "Digitar chave manualmente" ou "Não consigo ler o QR Code".
              </p>
              <form onSubmit={handleAddToken}>
                  <input placeholder="Nome do Serviço (ex: Gmail Principal)" value={newService} onChange={e => setNewService(e.target.value)} required />
                  <input placeholder="Chave Secreta (ex: JBSWY3DPEHPK3PXP)" value={newSecret} onChange={e => setNewSecret(e.target.value)} required style={{ fontFamily: 'monospace', textTransform: 'uppercase' }} />
                  <button type="submit" className="btn-primary" style={{ background: '#3b82f6' }}>Salvar Token</button>
              </form>
          </div>
      )}

      {tokens.length === 0 && !showAdd && (
          <div style={{ textAlign: 'center', padding: '50px', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '16px', color: '#64748b' }}>
              <Smartphone size={48} style={{ marginBottom: 15, opacity: 0.5 }} />
              <p>Nenhum autenticador configurado.</p>
              <button onClick={() => setShowAdd(true)} style={{ background: 'transparent', border: 'none', color: '#3b82f6', fontWeight: 'bold', cursor: 'pointer' }}>+ Adicionar o primeiro</button>
          </div>
      )}

      <div className="vault-grid">
          {tokens.map(token => (
              <div key={token.id} className="menu-card" style={{ cursor: 'default', flexDirection: 'column', alignItems: 'flex-start', gap: 10, ['--hover-color' as any]: '#3b82f6' }}>
                  
                  {/* CABEÇALHO DO CARD */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <ShieldCheck size={20} color="#3b82f6" />
                          <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{token.service_name}</span>
                      </div>
                      {/* Timer Circular */}
                      <div style={{ position: 'relative', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                           <svg width="24" height="24" viewBox="0 0 36 36">
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#334155" strokeWidth="4" />
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={progress < 5 ? '#ef4444' : '#3b82f6'} strokeWidth="4" strokeDasharray={`${(progress / 30) * 100}, 100`} style={{ transition: 'stroke-dasharray 1s linear' }} />
                           </svg>
                           <span style={{ position: 'absolute', fontSize: '0.6rem', fontWeight: 'bold', color: progress < 5 ? '#ef4444' : '#94a3b8' }}>{progress}</span>
                      </div>
                  </div>

                  {/* ÁREA DO CÓDIGO E BOTÃO (CORRIGIDA COM FLEXBOX) */}
                  <div style={{ width: '100%', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'stretch', overflow: 'hidden' }}>
                      
                      {/* 1. Área do Código (Texto) */}
                      <div style={{ flex: 1, padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                           <div style={{ fontSize: '1.8rem', fontFamily: 'monospace', letterSpacing: '3px', fontWeight: 700, color: progress < 5 ? '#ef4444' : 'white', transition: 'color 0.3s', whiteSpace: 'nowrap' }}>
                                {codes[token.id] ? codes[token.id].replace(/(\d{3})(\d{3})/, '$1 $2') : <Loader2 className="spin-animation" size={24} />}
                           </div>
                      </div>

                      {/* 2. Área do Botão (Separada) */}
                      <button 
                        onClick={() => { navigator.clipboard.writeText(codes[token.id]); alert('Copiado!'); }}
                        style={{ background: 'rgba(255,255,255,0.05)', borderLeft: '1px solid rgba(255,255,255,0.05)', borderRight: 'none', borderTop: 'none', borderBottom: 'none', color: '#94a3b8', cursor: 'pointer', width: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                        onMouseEnter={(e) => {e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white'}}
                        onMouseLeave={(e) => {e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#94a3b8'}}
                        title="Copiar código"
                      >
                          <Copy size={20} />
                      </button>
                  </div>

                  {/* BOTÃO REMOVER */}
                  <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
                      <button onClick={() => handleDelete(token.id)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', padding: 5 }}>
                          <Trash2 size={14} /> Remover
                      </button>
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
}