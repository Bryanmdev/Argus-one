import { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { encryptLight, decryptLight } from '../utils/security'; 
import { Trash2, Plus, Lock, Search, ArrowLeft, Save, FileText, ShieldCheck, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import '../App.css';

const PinInput = ({ value, onChange, placeholder }: any) => (
  <div style={{ position: 'relative', width: '100%' }}>
    <input
      type="password"
      inputMode="numeric"
      pattern="[0-9]*"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required
      maxLength={8}
      style={{ 
        paddingRight: '45px', 
        paddingLeft: '45px', // CORREÇÃO: Equilibra o espaço para o texto ficar no meio exato
        marginBottom: 0, 
        letterSpacing: '4px', 
        textAlign: 'center' 
      }} 
    />
  </div>
);

interface NoteItem {
  id: string;
  title_encrypted: string;
  content_encrypted: string;
  created_at: string;
}

interface SecureNotesProps {
  onBack: () => void;
}

export default function SecureNotes({ onBack }: SecureNotesProps) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isFirstAccess, setIsFirstAccess] = useState(false);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [editingNote, setEditingNote] = useState<NoteItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const idleTimerRef = useRef<number | null>(null);

  useEffect(() => { checkGlobalStatus(); }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // VOLTANDO PARA O BLOQUEIO LOCAL
  const handleLock = () => {
    setIsUnlocked(false);
    setPin('');
    setEditingNote(null);
    setIsCreating(false);
    showToast('Bloqueado.', 'success');
  };

  const resetIdleTimer = () => {
    if (!isUnlocked) return;
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
        handleLock(); // Chama o bloqueio local
    }, 5 * 60 * 1000);
  };

  useEffect(() => {
    if (isUnlocked) {
      window.addEventListener('mousemove', resetIdleTimer);
      window.addEventListener('keypress', resetIdleTimer);
      resetIdleTimer();
    } else {
      window.removeEventListener('mousemove', resetIdleTimer);
      window.removeEventListener('keypress', resetIdleTimer);
    }
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      window.removeEventListener('mousemove', resetIdleTimer);
      window.removeEventListener('keypress', resetIdleTimer);
    };
  }, [isUnlocked]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const checkGlobalStatus = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const { data: notesData } = await supabase.from('secure_notes').select('*').order('created_at', { ascending: false });
    const items = notesData || [];
    setNotes(items);

    if (items.length === 0) {
       const { count: vaultCount } = await supabase.from('vault_items').select('*', { count: 'exact', head: true });
       if (vaultCount && vaultCount > 0) setIsFirstAccess(false);
       else setIsFirstAccess(true);
    } else {
      setIsFirstAccess(false);
    }
    setLoading(false);
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) return;
    setLoading(true);

    if (isFirstAccess) {
      if (pin.length < 4) { showToast('Mínimo 4 dígitos', 'error'); setLoading(false); return; }
      if (pin !== confirmPin) { showToast('PINs não conferem', 'error'); setLoading(false); return; }
      
      setIsUnlocked(true);
      showToast('Área segura criada!', 'success');
    } else {
      let isValid = false;
      if (notes.length > 0) {
         const testNote = notes[0];
         if (decryptLight(testNote.title_encrypted, pin)) isValid = true;
      } else {
         isValid = true; 
      }

      if (isValid) { setIsUnlocked(true); } 
      else { showToast('PIN Incorreto', 'error'); }
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!formTitle.trim() || !formContent.trim()) { showToast('Preencha título e conteúdo', 'error'); return; }
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { showToast('Sessão expirada.', 'error'); setLoading(false); return; }

    const titleEnc = encryptLight(formTitle, pin);
    const contentEnc = encryptLight(formContent, pin);

    if (editingNote) {
      const { error } = await supabase.from('secure_notes').update({
        title_encrypted: titleEnc, content_encrypted: contentEnc
      }).eq('id', editingNote.id);
      if (!error) { showToast('Nota atualizada!', 'success'); refreshNotes(); closeEditor(); } 
      else { showToast('Erro: ' + error.message, 'error'); }
    } else {
      const { error } = await supabase.from('secure_notes').insert({
        user_id: user.id, title_encrypted: titleEnc, content_encrypted: contentEnc
      });
      if (!error) { showToast('Nota salva!', 'success'); setIsFirstAccess(false); refreshNotes(); closeEditor(); } 
      else { showToast('Erro: ' + error.message, 'error'); }
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if(!confirm('Excluir esta nota permanentemente?')) return;
    const { error } = await supabase.from('secure_notes').delete().eq('id', id);
    if (!error) { showToast('Nota excluída', 'success'); refreshNotes(); if (editingNote?.id === id) closeEditor(); }
  };

  const refreshNotes = async () => {
    const { data } = await supabase.from('secure_notes').select('*').order('created_at', { ascending: false });
    setNotes(data || []);
  };

  const openEditor = (note?: NoteItem) => {
    if (note) {
      const t = decryptLight(note.title_encrypted, pin) || '';
      const c = decryptLight(note.content_encrypted, pin) || '';
      setFormTitle(t);
      setFormContent(c);
      setEditingNote(note);
    } else {
      setFormTitle('');
      setFormContent('');
      setEditingNote(null);
      setIsCreating(true);
    }
  };

  const closeEditor = () => {
    setEditingNote(null);
    setIsCreating(false);
    setFormTitle('');
    setFormContent('');
  };

  const filteredNotes = useMemo(() => {
    return notes.filter(n => {
      const t = decryptLight(n.title_encrypted, pin) || '';
      return t.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [notes, searchTerm, pin]);

  if (!isUnlocked) {
    return (
      <div className="container" style={{paddingTop: '50px'}}>
        <button onClick={onBack} style={{background: 'transparent', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 30, border: 'none', cursor: 'pointer'}}>
            <ArrowLeft size={18}/> Voltar
        </button>
        {toast && <div className={`toast ${toast.type}`}>{toast.type === 'success' ? <CheckCircle size={18}/> : <AlertCircle size={18}/>}{toast.message}</div>}

        <div className="card" style={{ textAlign: 'center', maxWidth: '400px', margin: '0 auto', minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {loading ? (
             <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 15, color: '#94a3b8'}}>
                 <Loader2 className="spin-animation" size={40} color="var(--accent)" />
                 <p>Acessando Notas...</p>
             </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <ShieldCheck size={48} color={isFirstAccess ? "#10b981" : "#8b5cf6"} />
              </div>
              <h2 style={{fontFamily: 'var(--font-display)'}}>{isFirstAccess ? 'Configurar PIN das Notas' : 'Acesso às Notas'}</h2>
              <p style={{color: '#94a3b8', marginBottom: '20px'}}>{isFirstAccess ? 'Defina um PIN (será usado em todo o app).' : 'Digite seu PIN.'}</p>
              
              <form onSubmit={handleUnlock}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '15px' }}>
                  <PinInput placeholder="PIN" value={pin} onChange={(e: any) => setPin(e.target.value)} />
                  {isFirstAccess && (
                    <PinInput placeholder="Confirme o PIN" value={confirmPin} onChange={(e: any) => setConfirmPin(e.target.value)} />
                  )}
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>{isFirstAccess ? 'Criar Acesso' : 'Desbloquear'}</button>
              </form>
            </>
          )}
        </div>
      </div>
    );
  }

  if (isCreating || editingNote) {
    return (
      <div style={{width: '100%', maxWidth: '800px', margin: '0 auto'}}>
        {toast && <div className={`toast ${toast.type}`}>{toast.type === 'success' ? <CheckCircle size={18}/> : <AlertCircle size={18}/>}{toast.message}</div>}
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
           <button onClick={closeEditor} style={{background: 'transparent', color: '#94a3b8', border: 'none', display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer'}}>
             <ArrowLeft size={18}/> Voltar
           </button>
           <h2 style={{fontSize: '1.2rem', margin: 0}}>{editingNote ? 'Editar Nota' : 'Nova Nota Segura'}</h2>
           <button onClick={handleSave} className="btn-primary" style={{width: 'auto', padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 8}}>
             {loading ? <Loader2 className="spin-animation" size={18}/> : <><Save size={18}/> Salvar</>}
           </button>
        </div>
        <div className="card" style={{padding: '30px'}}>
           <input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Título da Nota" style={{fontSize: '1.5rem', fontWeight: 'bold', border: 'none', background: 'transparent', padding: '0 0 10px 0', borderRadius: 0, borderBottom: '1px solid #334155', marginBottom: '20px'}} />
           <textarea value={formContent} onChange={e => setFormContent(e.target.value)} placeholder="Digite seu conteúdo secreto aqui..." style={{width: '100%', minHeight: '400px', background: 'transparent', color: '#cbd5e1', border: 'none', resize: 'none', fontSize: '1rem', lineHeight: '1.6', outline: 'none', fontFamily: 'monospace'}} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      {toast && <div className={`toast ${toast.type}`}>{toast.type === 'success' ? <CheckCircle size={18}/> : <AlertCircle size={18}/>}{toast.message}</div>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div><h2 style={{margin: 0, fontSize: '1.8rem', fontFamily: 'var(--font-display)'}}>Notas <span style={{color: '#10b981'}}>Seguras</span></h2></div>
        <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={onBack} style={{background: 'transparent', border: '1px solid var(--border)', color: '#94a3b8', padding: '8px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', cursor: 'pointer'}}>
                <ArrowLeft size={16}/> Voltar
             </button>
            
            {/* BOTÃO CORRIGIDO: CHAMA handleLock */}
            <button onClick={handleLock} className="btn-danger" style={{ width: 'auto', padding: '8px 16px', fontSize: '0.9rem' }}>
              <Lock size={16} /> Bloquear
            </button>
        </div>
      </div>
      <div style={{display: 'flex', gap: 15, marginBottom: '30px'}}>
         <button onClick={() => openEditor()} className="btn-primary" style={{width: 'auto', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 8}}><Plus size={20}/> Criar Nota</button>
         <div style={{ position: 'relative', flex: 1 }}>
            <Search size={20} style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input type="text" placeholder="Pesquisar títulos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ paddingLeft: '45px', marginBottom: 0, height: '100%' }} />
         </div>
      </div>
      <div className="vault-grid">
         {filteredNotes.map(note => {
            const title = decryptLight(note.title_encrypted, pin);
            const content = decryptLight(note.content_encrypted, pin) || '';
            const preview = content.length > 100 ? content.substring(0, 100) + '...' : content;
            return (
              <div key={note.id} className="vault-item" style={{cursor: 'pointer', borderColor: 'rgba(16, 185, 129, 0.2)'}} onClick={() => openEditor(note)}>
                 <div style={{marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: 10, color: '#10b981'}}><FileText size={20} /><strong style={{fontSize: '1.1rem', color: 'white'}}>{title}</strong></div>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }} style={{background: 'transparent', border: 'none', color: '#ef4444', padding: 5, cursor: 'pointer'}} title="Excluir Nota"><Trash2 size={18} /></button>
                 </div>
                 <p style={{color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.5', flex: 1}}>{preview}</p>
                 <div style={{marginTop: '15px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem', color: '#64748b'}}>Criptografia AES Rápida</div>
              </div>
            );
         })}
         {filteredNotes.length === 0 && (
           <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '50px', color: '#64748b', border: '2px dashed #334155', borderRadius: '16px'}}>
              <FileText size={48} style={{opacity: 0.2, marginBottom: 15}}/><p>Nenhuma nota encontrada.</p>
           </div>
         )}
      </div>
    </div>
  );
}