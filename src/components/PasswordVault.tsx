import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { encrypt, decrypt } from '../utils/security';
import { Trash2, Copy, Eye, EyeOff, Search, Plus, Lock, ArrowLeft, RefreshCw, Save, X, Loader2 } from 'lucide-react';
import '../App.css';

interface VaultItem {
  id: string;
  site: string;
  username: string;
  password_encrypted: string;
  created_at: string;
}

interface PasswordVaultProps {
  onBack: () => void;
}

export default function PasswordVault({ onBack }: PasswordVaultProps) {
  const [vault, setVault] = useState<VaultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados do Formulário
  const [site, setSite] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [isCreating, setIsCreating] = useState(false);
  const [masterPassword, setMasterPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false); 
  
  const [visiblePasswordId, setVisiblePasswordId] = useState<string | null>(null);

  useEffect(() => {
    checkVaultStatus();
  }, []);

  const checkVaultStatus = async () => {
    const { count } = await supabase.from('vault_items').select('*', { count: 'exact', head: true });
    
    // CORREÇÃO AQUI: Se for 0, marcamos como vazio mas NÃO desbloqueamos.
    // O usuário PRECISA ver a tela de bloqueio para definir a senha.
    if (count === 0) {
      setIsEmpty(true);
    }
    // Removida a linha setIsUnlocked(true) que causava o erro
    setLoading(false);
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterPassword) return;
    setLoading(true);
    
    if (isEmpty) {
        // PRIMEIRO ACESSO: Define a senha mestra da sessão e entra
        setIsUnlocked(true);
    } else {
        // USO NORMAL: Valida a senha contra o primeiro item do banco
        const { data, error } = await supabase.from('vault_items').select('*').limit(1);
        
        if (error) {
            alert('Erro de conexão.');
        } else if (!data || data.length === 0) {
            // Caso de borda: Se estava marcado como cheio mas veio vazio
            setIsUnlocked(true);
        } else {
            const testItem = data[0];
            const decrypted = decrypt(testItem.password_encrypted, masterPassword);
            
            if (decrypted !== null) {
                setIsUnlocked(true);
                fetchVault();
            } else {
                alert('Senha Mestra Incorreta!');
                setMasterPassword('');
            }
        }
    }
    setLoading(false);
  };

  const fetchVault = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('vault_items').select('*').order('created_at', { ascending: false });
    if (error) console.error('Erro ao buscar:', error);
    else {
        setVault(data || []);
        if (data && data.length > 0) setIsEmpty(false);
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterPassword) { alert('Sessão expirada. Bloqueie e entre novamente.'); return; }
    
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
        const encryptedPass = encrypt(password, masterPassword);
        const { error } = await supabase.from('vault_items').insert({
            user_id: user.id,
            site,
            username,
            password_encrypted: encryptedPass
        });

        if (error) {
            alert('Erro ao salvar: ' + error.message);
        } else {
            setSite(''); setUsername(''); setPassword(''); setIsCreating(false);
            setIsEmpty(false);
            fetchVault();
        }
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta senha?')) {
        await supabase.from('vault_items').delete().eq('id', id);
        fetchVault();
    }
  };

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let pass = "";
    for (let i = 0; i < 16; i++) {
        pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
  };

  const filteredVault = useMemo(() => {
    return vault.filter(item => 
      item.site.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [vault, searchTerm]);

  // --- TELA DE BLOQUEIO (OU SETUP) ---
  if (!isUnlocked) {
    return (
        <div className="container" style={{paddingTop: '50px', textAlign: 'center'}}>
            <button onClick={onBack} style={{background: 'transparent', border: 'none', color: '#94a3b8', display: 'flex', gap: 5, alignItems: 'center', marginBottom: 20, cursor: 'pointer', fontSize: '0.9rem'}}>
                <ArrowLeft size={18}/> Voltar ao Menu
            </button>
            <div className="card" style={{maxWidth: '400px', margin: '0 auto', padding: '40px 20px'}}>
                <div style={{display: 'flex', justifyContent: 'center', marginBottom: 20}}>
                    <div style={{background: 'rgba(139, 92, 246, 0.1)', padding: 20, borderRadius: '50%'}}>
                        <Lock size={40} color="#8b5cf6" />
                    </div>
                </div>
                <h2 style={{fontFamily: 'var(--font-display)', marginBottom: 10, fontSize: '1.5rem'}}>
                    {isEmpty ? 'Configurar Cofre' : 'Cofre Bloqueado'}
                </h2>
                <p style={{color: '#94a3b8', marginBottom: 25, fontSize: '0.9rem', lineHeight: '1.4'}}>
                    {isEmpty 
                        ? 'Seu cofre está vazio. Crie uma Senha Mestra agora. Ela será usada para criptografar tudo.' 
                        : 'Digite sua Senha Mestra para descriptografar e acessar suas contas.'}
                </p>
                
                <form onSubmit={handleUnlock}>
                    <input 
                        type="password" 
                        placeholder={isEmpty ? "Crie sua Senha Mestra" : "Senha Mestra"}
                        value={masterPassword}
                        onChange={e => setMasterPassword(e.target.value)}
                        style={{textAlign: 'center', fontSize: '1.1rem', letterSpacing: 2, padding: '12px'}}
                        autoFocus
                    />
                    <button type="submit" className="btn-primary" style={{width: '100%', marginTop: 10}} disabled={loading}>
                        {loading ? <Loader2 className="spin-animation" /> : (isEmpty ? 'Definir Senha e Entrar' : 'Desbloquear')}
                    </button>
                </form>
            </div>
        </div>
    );
  }

  // --- TELA PRINCIPAL DO COFRE ---
  return (
    <div style={{width: '100%'}}>
      {/* CABEÇALHO REORGANIZADO */}
      <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '30px',
          flexWrap: 'wrap', 
          gap: '15px' 
      }}>
        <div style={{flex: 1, minWidth: '200px'}}>
            <h2 style={{margin: 0, fontSize: '1.8rem', fontFamily: 'var(--font-display)', lineHeight: 1}}>
                Cofre de <span style={{color: '#8b5cf6'}}>Senhas</span>
            </h2>
        </div>
        
        <div style={{display: 'flex', gap: 10}}>
            {/* Botão Voltar (Visual mais limpo) */}
            <button onClick={onBack} style={{
                background: 'rgba(255,255,255,0.05)', 
                border: '1px solid var(--border)', 
                color: '#cbd5e1', 
                padding: '10px 16px', 
                borderRadius: '8px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                fontSize: '0.9rem', 
                cursor: 'pointer',
                fontWeight: 500
            }}>
                <ArrowLeft size={16}/> Voltar
            </button>
            
            {/* Botão Nova Senha (Destaque) */}
            <button onClick={() => setIsCreating(!isCreating)} className="btn-primary" style={{
                width: 'auto', 
                padding: '10px 20px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8,
                fontSize: '0.9rem'
            }}>
               {isCreating ? <X size={18}/> : <Plus size={18}/>} 
               {isCreating ? 'Cancelar' : 'Nova Senha'}
            </button>
        </div>
      </div>

      {isCreating && (
        <div className="card" style={{marginBottom: 30, border: '1px solid #8b5cf6'}}>
            <h3 style={{marginTop: 0, marginBottom: 20}}>Adicionar Credencial</h3>
            <form onSubmit={handleSave}>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 15, marginBottom: 15}}>
                    <input placeholder="Site / Nome (ex: Google)" value={site} onChange={e => setSite(e.target.value)} required />
                    <input placeholder="Usuário / Email" value={username} onChange={e => setUsername(e.target.value)} required />
                </div>
                <div style={{display: 'flex', gap: 10, marginBottom: 15}}>
                    <input 
                        type="text" 
                        placeholder="Senha" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        required 
                        style={{flex: 1, fontFamily: 'monospace'}}
                    />
                    <button type="button" onClick={generatePassword} style={{background: 'rgba(255,255,255,0.1)', border: '1px solid var(--border)', color: '#cbd5e1', padding: '0 15px', borderRadius: '8px', cursor: 'pointer'}} title="Gerar Senha Forte">
                        <RefreshCw size={18} />
                    </button>
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? <Loader2 className="spin-animation"/> : <><Save size={18} /> Criptografar e Salvar</>}
                </button>
            </form>
        </div>
      )}

      <div style={{marginBottom: 20, position: 'relative'}}>
          <Search size={20} style={{position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8'}} />
          <input 
            type="text" 
            placeholder="Pesquisar..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{paddingLeft: 45, height: 50, fontSize: '1rem', borderRadius: 12, width: '100%', boxSizing: 'border-box'}}
          />
      </div>

      <div className="vault-grid">
          {filteredVault.map(item => {
              const isVisible = visiblePasswordId === item.id;
              const decryptedPassword = isVisible ? decrypt(item.password_encrypted, masterPassword) : '••••••••••••';

              return (
                <div key={item.id} className="vault-item">
                    <div style={{marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                        <div style={{fontWeight: 'bold', fontSize: '1.1rem', color: 'white'}}>{item.site}</div>
                        <button onClick={() => handleDelete(item.id)} style={{background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.7}}><Trash2 size={16}/></button>
                    </div>
                    
                    <div style={{fontSize: '0.9rem', color: '#94a3b8', marginBottom: 15}}>{item.username}</div>
                    
                    <div style={{background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <div style={{fontFamily: 'monospace', fontSize: '1rem', color: isVisible ? '#10b981' : '#64748b', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                            {decryptedPassword}
                        </div>
                        <div style={{display: 'flex', gap: 10}}>
                            <button onClick={() => setVisiblePasswordId(isVisible ? null : item.id)} style={{background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer'}}>
                                {isVisible ? <EyeOff size={16}/> : <Eye size={16}/>}
                            </button>
                            <button 
                                onClick={() => {
                                    const pass = decrypt(item.password_encrypted, masterPassword);
                                    if(pass) { navigator.clipboard.writeText(pass); alert('Senha copiada!'); }
                                }} 
                                style={{background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer'}}
                            >
                                <Copy size={16}/>
                            </button>
                        </div>
                    </div>
                </div>
              );
          })}
          
          {filteredVault.length === 0 && !loading && (
              <div style={{gridColumn: '1/-1', textAlign: 'center', padding: 60, color: '#64748b', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: 16}}>
                  <p>Nenhuma senha encontrada.</p>
                  <p style={{fontSize: '0.8rem', marginTop: 10}}>Clique em "Nova Senha" para começar.</p>
              </div>
          )}
      </div>
    </div>
  );
}
