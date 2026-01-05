import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { encryptData, decryptData } from '../utils/security';
import { Trash2, Copy, Lock, Plus, Eye, EyeOff, ShieldCheck, Zap, Search, Pencil, CheckCircle, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import '../App.css';

interface VaultItem {
  id: string;
  site_name: string;
  username_encrypted: string;
  password_encrypted: string;
}

interface PasswordVaultProps {
  onBack: () => void;
}

const CustomInput = ({ value, onChange, placeholder, show, onToggle, onGenerate, isPin = false }: any) => (
  <div style={{ position: 'relative', width: '100%' }}>
    <input
      type={show ? "text" : "password"}
      inputMode={isPin ? "numeric" : "text"} 
      pattern={isPin ? "[0-9]*" : undefined} 
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required
      maxLength={isPin ? 8 : undefined} 
      style={{ 
        // CORREÇÃO: Adicionei paddingLeft condicional para centralizar o PIN
        paddingRight: onGenerate ? '80px' : '45px', 
        paddingLeft: isPin ? '45px' : '15px', // Se for PIN, equilibra com a direita. Se texto, normal.
        marginBottom: 0, 
        letterSpacing: isPin ? '4px' : 'normal', 
        textAlign: isPin ? 'center' : 'left' 
      }} 
    />
    <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '8px', alignItems: 'center' }}>
      {onGenerate && (
        <button type="button" onClick={onGenerate} title="Gerar" style={{ background: 'transparent', color: '#10b981', padding: 0 }}>
          <Zap size={20} />
        </button>
      )}
      <button type="button" onClick={onToggle} style={{ background: 'transparent', color: '#94a3b8', padding: 0 }}>
        {show ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  </div>
);

export default function PasswordVault({ onBack }: PasswordVaultProps) {
  const [masterPin, setMasterPin] = useState('');
  const [confirmPin, setConfirmPin] = useState(''); 
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isFirstAccess, setIsFirstAccess] = useState(false); 
  const [items, setItems] = useState<VaultItem[]>([]);
  const [loading, setLoading] = useState(true); 

  const [showForm, setShowForm] = useState(false);
  const [newSite, setNewSite] = useState('');
  const [newUser, setNewUser] = useState('');
  const [newPass, setNewPass] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [showMasterPin, setShowMasterPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [visiblePasswordId, setVisiblePasswordId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const idleTimerRef = useRef<number | null>(null);

  useEffect(() => { checkVaultStatus(); }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // VOLTANDO PARA O BLOQUEIO LOCAL (Sem reload)
  const handleLock = () => {
    setIsUnlocked(false);
    setMasterPin('');
    setShowForm(false);
    showToast('Bloqueado com segurança.', 'success');
  };

  const resetIdleTimer = () => {
    if (!isUnlocked) return; 
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      handleLock(); // Usa a função local em vez de reload
    }, 5 * 60 * 1000); 
  };

  useEffect(() => {
    if (isUnlocked) {
      window.addEventListener('mousemove', resetIdleTimer);
      window.addEventListener('keypress', resetIdleTimer);
      window.addEventListener('click', resetIdleTimer);
      resetIdleTimer();
    } else {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      window.removeEventListener('mousemove', resetIdleTimer);
      window.removeEventListener('keypress', resetIdleTimer);
      window.removeEventListener('click', resetIdleTimer);
    }
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      window.removeEventListener('mousemove', resetIdleTimer);
      window.removeEventListener('keypress', resetIdleTimer);
      window.removeEventListener('click', resetIdleTimer);
    };
  }, [isUnlocked]);

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const val = e.target.value;
    if (/^\d*$/.test(val)) setter(val);
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const checkVaultStatus = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); 
    const { data } = await supabase.from('vault_items').select('*').order('created_at', { ascending: false });
    const loadedItems = data || [];
    setItems(loadedItems);

    if (loadedItems.length === 0) { 
        setIsFirstAccess(true); 
        setShowForm(true); 
    } else { 
        setIsFirstAccess(false); 
    }
    setLoading(false);
  };

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterPin) return;
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (isFirstAccess) {
      if (masterPin.length < 4) { showToast('PIN deve ter no mínimo 4 dígitos!', 'error'); setLoading(false); return; }
      if (masterPin !== confirmPin) { showToast('Os PINs não coincidem!', 'error'); setLoading(false); return; }
      showToast('PIN de Acesso definido!', 'success');
      setIsUnlocked(true);
    } else {
      if (items.length === 0) {
          setIsUnlocked(true);
      } else {
          const testItem = items[0];
          const testDecryption = decryptData(testItem.password_encrypted, masterPin);
          if (testDecryption) { setItems(items); setIsUnlocked(true); } 
          else { showToast('PIN Incorreto!', 'error'); }
      }
    }
    setLoading(false);
  };

  const handleEdit = (item: VaultItem) => {
    const user = decryptData(item.username_encrypted, masterPin);
    const pass = decryptData(item.password_encrypted, masterPin);
    if (user && pass) {
      setNewSite(item.site_name); setNewUser(user); setNewPass(pass);
      setEditingId(item.id); setShowForm(true); 
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCloseForm = () => {
    setNewSite(''); setNewUser(''); setNewPass(''); setEditingId(null); setShowForm(false);
  };

  const fetchItems = async () => {
      const { data } = await supabase.from('vault_items').select('*').order('created_at', { ascending: false });
      setItems(data || []);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    const userEncrypted = encryptData(newUser, masterPin);
    const passEncrypted = encryptData(newPass, masterPin);

    if (editingId) {
      const { error } = await supabase.from('vault_items').update({
        site_name: newSite, username_encrypted: userEncrypted, password_encrypted: passEncrypted,
      }).eq('id', editingId);
      if (!error) { showToast('Conta atualizada!', 'success'); handleCloseForm(); fetchItems(); } 
      else { showToast('Erro: ' + error.message, 'error'); }
    } else {
      const { error } = await supabase.from('vault_items').insert({
        site_name: newSite, username_encrypted: userEncrypted, password_encrypted: passEncrypted,
      });
      if (!error) { showToast('Conta adicionada!', 'success'); handleCloseForm(); setIsFirstAccess(false); fetchItems(); } 
      else { showToast('Erro: ' + error.message, 'error'); }
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza?')) return;
    await supabase.from('vault_items').delete().eq('id', id);
    if (editingId === id) handleCloseForm();
    showToast('Item removido.', 'success');
    fetchItems();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copiado!', 'success');
  };

  const generateStrongPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
    let password = "";
    for (let i = 0; i < 16; i++) {
      password += chars.substring(Math.floor(Math.random() * chars.length), Math.floor(Math.random() * chars.length) + 1);
    }
    setNewPass(password); setShowNewPass(true); 
    showToast('Senha forte gerada!', 'success');
  };

  const getFaviconUrl = (siteName: string) => {
    const domain = siteName.includes('.') ? siteName : `${siteName}.com`;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  };

  const getPasswordStrength = (pass: string) => {
    if (!pass) return null;
    let score = 0;
    if (pass.length >= 8) score++;
    if (pass.length >= 12) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    if (score < 3) return 'weak';
    if (score < 5) return 'medium';
    return 'strong';
  };

  const strength = getPasswordStrength(newPass);
  const filteredItems = items.filter(item => item.site_name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (!isUnlocked) {
    return (
      <div className="container" style={{paddingTop: '50px'}}> 
        <button onClick={onBack} style={{background: 'transparent', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 30, fontSize: '0.9rem', border: 'none', cursor: 'pointer'}}>
            <ArrowLeft size={18}/> Voltar ao Menu
        </button>

        {toast && <div className={`toast ${toast.type}`}>{toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}{toast.message}</div>}
        
        <div className="card" style={{ textAlign: 'center', maxWidth: '400px', margin: '0 auto', minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {loading ? (
             <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 15, color: '#94a3b8'}}>
                 <Loader2 className="spin-animation" size={40} color="var(--accent)" />
                 <p>Verificando acesso...</p>
             </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                {isFirstAccess ? <ShieldCheck size={48} color="#10b981" /> : <Lock size={48} color="#8b5cf6" />}
              </div>
              <h2 style={{fontFamily: 'var(--font-display)'}}>{isFirstAccess ? 'Configurar PIN' : 'Acesso Restrito'}</h2>
              <p style={{color: '#94a3b8', marginBottom: '20px'}}>{isFirstAccess ? 'Crie um PIN numérico para proteger suas contas.' : 'Digite seu PIN.'}</p>
              
              <form onSubmit={handleAuthAction}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '15px' }}>
                  <CustomInput placeholder="PIN" value={masterPin} onChange={(e: any) => handlePinChange(e, setMasterPin)} show={showMasterPin} onToggle={() => setShowMasterPin(!showMasterPin)} isPin={true} />
                  {isFirstAccess && (
                    <CustomInput placeholder="Confirme o PIN" value={confirmPin} onChange={(e: any) => handlePinChange(e, setConfirmPin)} show={showConfirmPin} onToggle={() => setShowConfirmPin(!showConfirmPin)} isPin={true} />
                  )}
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>{isFirstAccess ? 'Definir PIN' : 'Desbloquear'}</button>
              </form>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      {toast && <div className={`toast ${toast.type}`}>{toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}{toast.message}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div><h2 style={{margin: 0, fontSize: '1.8rem', fontFamily: 'var(--font-display)'}}>Cofre de <span style={{color: 'var(--accent)'}}>Contas</span></h2></div>
        <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={onBack} style={{background: 'transparent', border: '1px solid var(--border)', color: '#94a3b8', padding: '8px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', transition: 'all 0.2s ease'}}>
                <ArrowLeft size={16}/> Voltar
             </button>
            
            {/* BOTÃO CORRIGIDO: CHAMA handleLock */}
            <button onClick={handleLock} className="btn-danger" style={{ width: 'auto', padding: '8px 16px', fontSize: '0.9rem' }}>
              <Lock size={16} /> Bloquear
            </button>
        </div>
      </div>

      {!showForm ? (
        <button onClick={() => setShowForm(true)} className="btn-add-placeholder"><Plus size={24} /> Adicionar Nova Conta</button>
      ) : (
        <div className="card" style={{ borderColor: editingId ? '#10b981' : '#334155' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 10, color: editingId ? '#10b981' : 'white', margin: 0 }}>
              {editingId ? <Pencil size={20}/> : <Plus size={20}/>} {editingId ? 'Editar Conta' : 'Adicionar Nova'}
            </h3>
          </div>
          <form onSubmit={handleSave}>
            <input placeholder="Nome do Site (ex: Amazon, Netflix)" value={newSite} onChange={e => setNewSite(e.target.value)} required autoFocus />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '10px' }}>
              <input placeholder="Usuário/Email" value={newUser} onChange={e => setNewUser(e.target.value)} required style={{marginBottom: 0}} />
              <div>
                <CustomInput placeholder="Senha" value={newPass} onChange={(e: any) => setNewPass(e.target.value)} show={showNewPass} onToggle={() => setShowNewPass(!showNewPass)} onGenerate={generateStrongPassword} />
                {newPass && strength && <div className="strength-meter-container"><div className={`strength-meter-fill strength-${strength}`}></div></div>}
                {newPass && strength && <div className="strength-text" style={{ color: strength === 'weak' ? '#ef4444' : strength === 'medium' ? '#f59e0b' : '#10b981' }}>{strength === 'weak' ? 'Fraca' : strength === 'medium' ? 'Média' : 'Forte'}</div>}
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading} style={{ backgroundColor: editingId ? '#10b981' : '' }}>{loading ? '...' : (editingId ? 'Atualizar' : 'Salvar')}</button>
              <button type="button" onClick={handleCloseForm} className="btn-danger">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {items.length > 0 && (
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <Search size={20} style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input type="text" placeholder="Pesquisar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ paddingLeft: '45px' }} />
        </div>
      )}

      <div className="vault-grid">
        {filteredItems.map((item) => {
          const decryptedUser = decryptData(item.username_encrypted, masterPin);
          const decryptedPass = decryptData(item.password_encrypted, masterPin);
          const isPassVisible = visiblePasswordId === item.id;
          const isEditing = editingId === item.id; 
          return (
            <div key={item.id} className="vault-item" style={{ borderColor: isEditing ? '#10b981' : '#334155', opacity: (editingId && !isEditing) ? 0.5 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <div style={{display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden'}}>
                  <img src={getFaviconUrl(item.site_name)} alt="icon" style={{width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', backgroundColor: 'white'}} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  <strong style={{ fontSize: '1.2em', color: isEditing ? '#10b981' : 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.site_name}</strong>
                </div>
                <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                  <button onClick={() => handleEdit(item)} disabled={!!editingId} style={{ background: 'transparent', padding: 5, color: '#3b82f6' }}> <Pencil size={18} /> </button>
                  <button onClick={() => handleDelete(item.id)} style={{ background: 'transparent', padding: 5, color: '#ef4444' }}> <Trash2 size={18} /> </button>
                </div>
              </div>
              {decryptedUser ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ background: '#020617', padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.9em', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>{decryptedUser}</span>
                    <Copy size={16} style={{ cursor: 'pointer', color: '#8b5cf6', flexShrink: 0 }} onClick={() => copyToClipboard(decryptedUser!)} />
                  </div>
                  <div style={{ background: '#020617', padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'monospace', color: isPassVisible ? '#a78bfa' : '#64748b', fontSize: '0.9em' }}>{isPassVisible ? decryptedPass : '••••••••'}</span>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <button onClick={() => setVisiblePasswordId(isPassVisible ? null : item.id)} style={{ background: 'transparent', padding: 0, color: '#94a3b8' }}>{isPassVisible ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                        <Copy size={16} style={{ cursor: 'pointer', color: '#8b5cf6' }} onClick={() => copyToClipboard(decryptedPass!)} />
                    </div>
                  </div>
                </div>
              ) : <span style={{color: 'red'}}>Erro</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}