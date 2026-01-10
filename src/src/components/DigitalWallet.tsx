import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { encryptLight, decryptLight, encryptData, decryptData } from '../utils/security'; // Adicionamos encryptData/decryptData para compatibilidade global
import { ArrowLeft, Plus, Trash2, CreditCard, Copy, Eye, EyeOff, Loader2, FileText, User, Pencil, X, ShieldCheck, Lock } from 'lucide-react';
import '../App.css';

// --- TEMAS VISUAIS ---
const CARD_THEMES = [
  { name: 'Roxo (Nubank)', bg: 'linear-gradient(105deg, #820ad1 0%, #460570 100%)', text: 'white' },
  { name: 'Laranja (Inter)', bg: 'linear-gradient(105deg, #ff7a00 0%, #ff5200 100%)', text: 'white' },
  { name: 'Preto (Black)', bg: 'linear-gradient(135deg, #111827 0%, #000000 100%)', text: '#f3f4f6' },
  { name: 'Azul (Tech)', bg: 'linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%)', text: 'white' },
  { name: 'Dourado (Gold)', bg: 'linear-gradient(135deg, #d97706 0%, #92400e 100%)', text: 'white' },
  { name: 'Cinza (Platinum)', bg: 'linear-gradient(135deg, #64748b 0%, #334155 100%)', text: 'white' },
];

const DOC_THEMES = [
  { name: 'Identidade (Azul)', bg: '#f8fafc', header: '#1e3a8a', text: '#334155' }, 
  { name: 'CNH (Verde)', bg: '#f0fdf4', header: '#14532d', text: '#14532d' }, 
  { name: 'Escuro (Dark)', bg: '#1e293b', header: '#0f172a', text: '#cbd5e1' },
];

const BRANDS = ['Mastercard', 'Visa', 'Elo', 'Amex', 'Hipercard', 'Outros'];

interface WalletItem {
  id: string;
  type: 'card' | 'document' | 'verifier';
  alias: string;
  field1_encrypted: string;
  field2_encrypted: string;
  field3_text: string;
  holder_name: string;
  color: string;
  card_brand?: string;
}

interface DigitalWalletProps {
  onBack: () => void;
}

export default function DigitalWallet({ onBack }: DigitalWalletProps) {
  const [items, setItems] = useState<WalletItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Auth States
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isFirstAccess, setIsFirstAccess] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'card' | 'document'>('card');
  const [editingItem, setEditingItem] = useState<WalletItem | null>(null);

  // Form States
  const [formAlias, setFormAlias] = useState('');
  const [formHolder, setFormHolder] = useState('');
  const [formField1, setFormField1] = useState('');
  const [formField2, setFormField2] = useState('');
  const [formField3, setFormField3] = useState('');
  const [formColor, setFormColor] = useState('');
  const [formBrand, setFormBrand] = useState('');

  const [visibleId, setVisibleId] = useState<string | null>(null);

  useEffect(() => { 
    checkGlobalStatus(); // Nome atualizado para refletir verificação global
    setFormColor(activeTab === 'card' ? CARD_THEMES[0].bg : DOC_THEMES[0].bg);
  }, [activeTab]);

  // --- NOVA VERIFICAÇÃO UNIFICADA ---
  const checkGlobalStatus = async () => {
    setLoading(true);
    
    // 1. Busca itens da carteira (para exibir depois)
    const { data: walletData } = await supabase.from('wallet_items').select('*').order('created_at', { ascending: false });
    if (walletData) setItems(walletData);

    // 2. VERIFICAÇÃO GLOBAL: Olha no Cofre (vault_items) se já existe o 'SYSTEM_VERIFIER'
    // Isso garante que se você criou o PIN lá, ele vale aqui.
    const { data: vaultCheck } = await supabase.from('vault_items').select('*').eq('site_name', 'SYSTEM_VERIFIER').single();

    if (vaultCheck) {
        // Se existe no cofre, NÃO é primeiro acesso, mesmo que a carteira esteja vazia.
        setIsFirstAccess(false);
    } else {
        // Se não achou no cofre, verifica se tem algum item na carteira (fallback legado)
        if (!walletData || walletData.length === 0) {
             setIsFirstAccess(true);
        } else {
             setIsFirstAccess(false);
        }
    }
    setLoading(false);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) return;
    if (isFirstAccess && pin.length < 4) { alert('PIN muito curto (mínimo 4 dígitos)'); return; }

    setLoading(true);

    if (isFirstAccess) {
        // --- CRIAÇÃO UNIFICADA DO PIN ---
        if (pin !== confirmPin) {
            alert('Os PINs não conferem!');
            setLoading(false);
            return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            // 1. Salva na CARTEIRA (Validação local rápida)
            const verifierPayload = encryptLight('VALIDATION_CHECK', pin);
            await supabase.from('wallet_items').insert({
                user_id: user.id,
                type: 'verifier',
                alias: 'SYSTEM_VERIFIER',
                holder_name: 'SYSTEM',
                field1_encrypted: verifierPayload,
                field2_encrypted: '',
                field3_text: '',
                color: '#000'
            });

            // 2. Salva no COFRE TAMBÉM (Para o PasswordVault reconhecer)
            const verifierUser = encryptData('VALID', pin);
            const verifierPass = encryptData('CHECK', pin);
            await supabase.from('vault_items').insert({
              user_id: user.id,
              site_name: 'SYSTEM_VERIFIER', 
              username_encrypted: verifierUser,
              password_encrypted: verifierPass
            });

            alert('PIN Global configurado com sucesso!');
            setIsFirstAccess(false);
            setIsUnlocked(true);
        }
    } else {
        // --- DESBLOQUEIO UNIFICADO ---
        let isValid = false;

        // TENTATIVA 1: Validar pelo Cofre (Padrão Ouro)
        const { data: vaultItems } = await supabase.from('vault_items').select('*').eq('site_name', 'SYSTEM_VERIFIER');
        
        if (vaultItems && vaultItems.length > 0) {
             // Usa a criptografia forte do cofre
             const check = decryptData(vaultItems[0].password_encrypted, pin);
             if (check === 'CHECK') isValid = true;
        } 
        
        // TENTATIVA 2: Se falhou ou não achou no cofre, tenta validar pela Carteira (Fallback)
        if (!isValid) {
            const walletVerifier = items.find(i => i.type === 'verifier');
            if (walletVerifier) {
                const val = decryptLight(walletVerifier.field1_encrypted, pin);
                if (val === 'VALIDATION_CHECK') isValid = true;
            } else if (items.length > 0) {
                 // Fallback legado: tenta descriptografar o primeiro item real
                 const testItem = items[0];
                 if (decryptLight(testItem.field1_encrypted, pin)) isValid = true;
            }
        }

        if (isValid) {
            setIsUnlocked(true);
        } else {
            alert('PIN Incorreto!');
            setPin('');
        }
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const f1Enc = encryptLight(formField1, pin);
    const f2Enc = encryptLight(formField2, pin);

    const payload = {
      alias: formAlias,
      holder_name: formHolder.toUpperCase(),
      field1_encrypted: f1Enc,
      field2_encrypted: f2Enc,
      field3_text: formField3,
      color: formColor,
      card_brand: formBrand
    };

    if (editingItem) {
      await supabase.from('wallet_items').update(payload).eq('id', editingItem.id);
    } else {
      await supabase.from('wallet_items').insert({ ...payload, user_id: user.id, type: activeTab });
    }
    
    closeEditor(); 
    const { data } = await supabase.from('wallet_items').select('*').order('created_at', { ascending: false });
    if(data) setItems(data);
    setLoading(false);
  };

  const handleEdit = (item: WalletItem) => {
    const val1 = decryptLight(item.field1_encrypted, pin) || '';
    const val2 = decryptLight(item.field2_encrypted, pin) || '';
    setFormAlias(item.alias); setFormHolder(item.holder_name); setFormField1(val1); setFormField2(val2);
    setFormField3(item.field3_text); setFormColor(item.color); setFormBrand(item.card_brand || '');
    setEditingItem(item); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir item?')) return;
    await supabase.from('wallet_items').delete().eq('id', id);
    if (editingItem?.id === id) closeEditor();
    const { data } = await supabase.from('wallet_items').select('*').order('created_at', { ascending: false });
    if(data) setItems(data);
  };

  const closeEditor = () => { setEditingItem(null); setShowForm(false); resetForm(); };
  const resetForm = () => { setFormAlias(''); setFormHolder(''); setFormField1(''); setFormField2(''); setFormField3(''); setFormBrand(''); };

  const formatCardNumber = (num: string) => num.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim();
  const getCleanNumber = (num: string) => num.replace(/\D/g, '');
  const renderBrandLogo = (brand?: string) => {
    if (!brand) return null;
    const b = brand.toLowerCase();
    if (b.includes('master')) return <div style={{display: 'flex', width: 30}}><div style={{width: 18, height: 18, background: '#eb001b', borderRadius: '50%', opacity: 0.9}}></div><div style={{width: 18, height: 18, background: '#f79e1b', borderRadius: '50%', marginLeft: -10, opacity: 0.9}}></div></div>;
    if (b.includes('visa')) return <div style={{fontWeight: 900, fontStyle: 'italic', letterSpacing: -1, fontSize: '1.2rem', color: 'white'}}>VISA</div>;
    return <div style={{fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase'}}>{brand}</div>;
  };

  const visibleItems = useMemo(() => items.filter(i => i.type !== 'verifier' && i.type === activeTab), [items, activeTab]);

  const ActionToolbar = ({ item }: { item: WalletItem }) => (
    <div style={{display: 'flex', gap: 4, background: 'rgba(255, 255, 255, 0.2)', padding: '3px 6px', borderRadius: '20px', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)'}}>
        <button onClick={() => setVisibleId(visibleId === item.id ? null : item.id)} style={{background: 'transparent', border: 'none', color: 'white', padding: 4, cursor: 'pointer'}}>{visibleId === item.id ? <EyeOff size={14}/> : <Eye size={14}/>}</button>
        <button onClick={() => handleEdit(item)} style={{background: 'transparent', border: 'none', color: 'white', padding: 4, cursor: 'pointer'}}><Pencil size={14}/></button>
        <button onClick={() => handleDelete(item.id)} style={{background: 'transparent', border: 'none', color: '#fca5a5', padding: 4, cursor: 'pointer'}}><Trash2 size={14}/></button>
    </div>
  );

  const renderCard = (item: WalletItem) => {
    const isVisible = visibleId === item.id;
    const val1 = decryptLight(item.field1_encrypted, pin) || '';
    const val2 = decryptLight(item.field2_encrypted, pin) || '';
    const displayNum = isVisible ? formatCardNumber(val1) : `•••• •••• •••• ${val1.slice(-4) || '0000'}`;

    return (
    <div key={item.id} style={{background: item.color, borderRadius: '18px', padding: '24px', position: 'relative', color: 'white', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', minHeight: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)'}}>
        <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.05, backgroundImage: 'url("https://www.transparenttextures.com/patterns/noise.png")', pointerEvents: 'none', zIndex: 0}}></div>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 10}}>
             <div><div style={{fontSize: '1rem', fontWeight: 700, marginBottom: 12}}>{item.alias}</div><div style={{width: 42, height: 28, background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.3)'}}></div></div>
             <ActionToolbar item={item} />
        </div>
        <div style={{marginTop: 10, marginBottom: 15, position: 'relative', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
             <span style={{fontSize: '1.3rem', fontFamily: "'Courier New', monospace", fontWeight: 700, letterSpacing: '1px', color: 'white', display: 'block'}}>{displayNum}</span>
             <button onClick={() => { navigator.clipboard.writeText(getCleanNumber(val1)); alert('Copiado!'); }} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: 'white', opacity: 0.8}}><Copy size={20} /></button>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 10}}>
             <div><div style={{fontSize: '0.6rem', opacity: 0.8, textTransform: 'uppercase'}}>Titular</div><div style={{fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase'}}>{item.holder_name}</div></div>
             <div style={{display: 'flex', gap: 20, alignItems: 'flex-end'}}>
                 <div><div style={{fontSize: '0.6rem', opacity: 0.8, textTransform: 'uppercase'}}>Validade</div><div style={{fontSize: '0.9rem', fontWeight: 600}}>{item.field3_text}</div></div>
                 <div style={{position: 'relative', textAlign: 'right'}}><div style={{position: 'absolute', top: -30, right: 0}}>{renderBrandLogo(item.card_brand)}</div><div style={{fontSize: '0.6rem', opacity: 0.8, textTransform: 'uppercase'}}>CVV</div><div style={{fontSize: '0.9rem', fontWeight: 600}}>{isVisible ? val2 : '•••'}</div></div>
             </div>
        </div>
    </div>
    );
  };

  const renderDocument = (item: WalletItem) => {
    const theme = DOC_THEMES.find(t => t.bg === item.color) || DOC_THEMES[0];
    const isDark = theme.bg.includes('#1e');
    const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
    const val1 = decryptLight(item.field1_encrypted, pin) || '';
    const val2 = decryptLight(item.field2_encrypted, pin) || '';
    const isVisible = visibleId === item.id;

    return (
      <div key={item.id} style={{background: item.color, borderRadius: '12px', color: theme.text, boxShadow: '0 4px 15px rgba(0,0,0,0.1)', minHeight: '200px', display: 'flex', flexDirection: 'column', border: `1px solid ${borderColor}`}}>
          <div style={{background: theme.header, color: 'white', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div style={{fontSize: '0.75rem', fontWeight: 700, letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 8}}><ShieldCheck size={16}/> {item.alias.toUpperCase()}</div>
              <ActionToolbar item={item} />
          </div>
          <div style={{display: 'flex', flex: 1, padding: '20px', gap: 16}}>
               <div style={{width: 70, height: 90, background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', border: `1px solid ${borderColor}`, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}><User size={30} style={{opacity: 0.3}} /></div>
               <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 10}}>
                   <div><div style={{fontSize: '0.6rem', opacity: 0.7}}>NOME</div><div style={{fontSize: '0.85rem', fontWeight: 700}}>{item.holder_name}</div></div>
                   <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10}}>
                       <div><div style={{fontSize: '0.6rem', opacity: 0.7}}>REGISTRO</div><div style={{fontSize: '0.8rem', fontWeight: 600, fontFamily: 'monospace'}}>{isVisible ? val1 : '••••••'}</div></div>
                       <div><div style={{fontSize: '0.6rem', opacity: 0.7}}>CPF</div><div style={{fontSize: '0.8rem', fontWeight: 600, fontFamily: 'monospace'}}>{isVisible ? val2 : '••••••'}</div></div>
                   </div>
               </div>
          </div>
      </div>
    );
  };

  if (!isUnlocked) {
    return (
      <div className="container" style={{paddingTop: '50px', textAlign: 'center'}}>
         <button onClick={onBack} style={{background: 'transparent', border: 'none', color: '#94a3b8', display: 'flex', gap: 5, alignItems: 'center', marginBottom: 20, cursor: 'pointer'}}><ArrowLeft size={18}/> Voltar</button>
         <div className="card" style={{maxWidth: '400px', margin: '0 auto', padding: '40px 20px'}}>
            <div style={{display: 'flex', justifyContent: 'center', marginBottom: 20}}>
                <div style={{background: 'rgba(245, 158, 11, 0.1)', padding: 20, borderRadius: '50%'}}><Lock size={40} color="#f59e0b" /></div>
            </div>
            <h2 style={{fontFamily: 'var(--font-display)', marginBottom: 10}}>{isFirstAccess ? 'Configurar PIN Global' : 'Acesso Seguro'}</h2>
            <p style={{color: '#94a3b8', marginBottom: 20}}>
                {isFirstAccess ? 'Defina um PIN único. Ele será usado para acessar suas senhas, cartões e notas.' : 'Digite seu PIN Mestre.'}
            </p>
            <form onSubmit={handleAuth}>
              <input type="password" inputMode="numeric" placeholder="PIN" value={pin} onChange={e => setPin(e.target.value)} style={{textAlign: 'center', letterSpacing: 4}} required maxLength={8}/>
              {isFirstAccess && (
                  <input type="password" inputMode="numeric" placeholder="Confirme o PIN" value={confirmPin} onChange={e => setConfirmPin(e.target.value)} style={{textAlign: 'center', letterSpacing: 4, marginTop: 10}} required maxLength={8}/>
              )}
              <button className="btn-primary" style={{width: '100%', marginTop: 15, background: '#f59e0b', borderColor: '#f59e0b'}} disabled={loading}>
                  {loading ? <Loader2 className="spin-animation"/> : (isFirstAccess ? 'Definir Acesso Global' : 'Desbloquear')}
              </button>
            </form>
         </div>
      </div>
    );
  }

  return (
    <div style={{width: '100%'}}>
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div><h2 style={{margin: 0, fontSize: '1.8rem', fontFamily: 'var(--font-display)'}}>Carteira <span style={{color: '#f59e0b'}}>Digital</span></h2></div>
        <div style={{display: 'flex', gap: 10}}>
            <button onClick={onBack} style={{background: 'transparent', border: '1px solid var(--border)', color: '#94a3b8', padding: '8px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', cursor: 'pointer'}}><ArrowLeft size={16}/> Voltar</button>
            <button onClick={() => {setShowForm(!showForm); resetForm(); setEditingItem(null);}} className="btn-primary" style={{width: 'auto', padding: '8px 16px', background: '#f59e0b', borderColor: '#f59e0b'}}><Plus size={18}/> {showForm ? 'Fechar' : 'Adicionar'}</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button onClick={() => { setActiveTab('card'); setShowForm(false); }} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: activeTab === 'card' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.05)', color: activeTab === 'card' ? '#f59e0b' : '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><CreditCard size={18} /> Cartões</button>
          <button onClick={() => { setActiveTab('document'); setShowForm(false); }} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: activeTab === 'document' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.05)', color: activeTab === 'document' ? '#3b82f6' : '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><FileText size={18} /> Documentos</button>
      </div>

      {showForm && (
        <div className="card" style={{marginBottom: 30, border: `1px solid ${activeTab === 'card' ? '#f59e0b' : '#3b82f6'}`}}>
           <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15}}>
              <h3 style={{margin: 0}}>{editingItem ? 'Editar' : 'Novo'} {activeTab === 'card' ? 'Cartão' : 'Documento'}</h3>
              {editingItem && <button onClick={closeEditor} style={{background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer'}}><X size={20}/></button>}
           </div>
           
           <form onSubmit={handleSave}>
              <input placeholder={activeTab === 'card' ? "Apelido (ex: Nubank)" : "Apelido (ex: Meu RG)"} value={formAlias} onChange={e => setFormAlias(e.target.value)} required />
              {activeTab === 'card' && (
                <select value={formBrand} onChange={e => setFormBrand(e.target.value)} style={{width: '100%', padding: '12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: 'white', marginBottom: 15}}>
                    <option value="">Selecione a Bandeira...</option>
                    {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              )}
              <input placeholder={activeTab === 'card' ? "Nome no Cartão" : "Nome Completo"} value={formHolder} onChange={e => setFormHolder(e.target.value)} required />
              <div style={{display: 'flex', gap: 10, flexDirection: 'column'}}>
                 <input placeholder={activeTab === 'card' ? "Número do Cartão" : "Número do Registro (RG/CNH)"} value={formField1} onChange={e => setFormField1(e.target.value)} required />
                 <div style={{display: 'flex', gap: 10}}>
                    <input placeholder={activeTab === 'card' ? "CVV" : "CPF / Outro"} value={formField2} onChange={e => setFormField2(e.target.value)} required style={{flex: 1}} />
                    <input placeholder={activeTab === 'card' ? "Validade (MM/AA)" : "Órgão Emissor / Data"} value={formField3} onChange={e => setFormField3(e.target.value)} required style={{flex: 1}} />
                 </div>
              </div>
              <div style={{marginTop: 15, marginBottom: 15}}>
                <label style={{fontSize: '0.9rem', color: '#94a3b8', display: 'block', marginBottom: 5}}>Cor de Fundo:</label>
                <div style={{display: 'flex', gap: 10, flexWrap: 'wrap'}}>
                   {(activeTab === 'card' ? CARD_THEMES : DOC_THEMES).map(t => (
                     <div key={t.name} onClick={() => setFormColor(t.bg)} style={{ width: 32, height: 32, borderRadius: '50%', background: t.bg, cursor: 'pointer', border: formColor === t.bg ? '2px solid white' : '1px solid rgba(255,255,255,0.2)' }} title={t.name}/>
                   ))}
                </div>
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>{loading ? <Loader2 className="spin-animation"/> : (editingItem ? 'Atualizar' : 'Salvar')}</button>
           </form>
        </div>
      )}

      <div className="vault-grid">
         {visibleItems.length === 0 && (
           <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#64748b', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '16px'}}>
              <p>Nenhuma credencial salva ainda.</p>
           </div>
         )}
         {visibleItems.map(item => item.type === 'card' ? renderCard(item) : renderDocument(item))}
      </div>
    </div>
  );
}