import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Loader2, Mail, Lock, User, ArrowRight, KeyRound, CheckCircle, ArrowLeft, Calendar, AlertCircle } from 'lucide-react';
import '../App.css';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  
  // Campos do Formulário
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); 
  const [fullName, setFullName] = useState(''); 
  const [birthDate, setBirthDate] = useState(''); 
  const [otpCode, setOtpCode] = useState(''); 

  // Estados de Controle de Tela
  const [isSignUp, setIsSignUp] = useState(false); 
  const [awaitingVerification, setAwaitingVerification] = useState(false); 
  const [isRecovery, setIsRecovery] = useState(false);
  
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 5000);
  };

  // --- LÓGICA DE AUTENTICAÇÃO ---
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setToast(null); // Limpa erros anteriores

    try {
      if (isSignUp) {
        // Validações de Cadastro
        if (password !== confirmPassword) throw new Error("As senhas não coincidem.");
        if (!birthDate) throw new Error("A data de nascimento é obrigatória.");
        if (password.length < 6) throw new Error("A senha deve ter no mínimo 6 caracteres.");

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName, birth_date: birthDate } },
        });

        if (error) {
            // DETECÇÃO DE USUÁRIO DUPLICADO (Funciona se a proteção de enumeração estiver OFF no Supabase)
            if (error.status === 400 || error.message.includes('already registered') || error.message.includes('User already exists')) {
                throw new Error("Este e-mail já possui cadastro. Tente fazer login.");
            }
            throw error;
        }

        // Se chegou aqui e data.user é null, algo estranho aconteceu, mas geralmente é sucesso
        if (data.user && data.user.identities && data.user.identities.length === 0) {
             throw new Error("Este e-mail já existe. Tente fazer login.");
        }

        setAwaitingVerification(true);
        showToast('Código enviado! Verifique seu email.', 'success');
      } else {
        // Login
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw new Error("Email ou senha incorretos.");
      }
    } catch (error: any) {
      showToast(error.message || 'Erro na autenticação', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token: otpCode, type: 'signup' });
      if (error) throw error;
      showToast('Conta verificada com sucesso!', 'success');
      // Recarrega a página para entrar no app automaticamente
      window.location.reload();
    } catch (error: any) {
      showToast('Código inválido ou expirado.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!email.includes('@')) throw new Error("Email inválido.");
      if (!birthDate) throw new Error("Confirme a data de nascimento para segurança.");

      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
      if (error) throw error;
      showToast('Link de recuperação enviado para o email!', 'success');
      setIsRecovery(false); 
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- ESTILOS VISUAIS ---
  const inputContainerStyle: React.CSSProperties = { position: 'relative', width: '100%', height: '48px', marginBottom: '15px' };
  const iconWrapperStyle: React.CSSProperties = { position: 'absolute', left: 0, top: 0, height: '100%', width: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', pointerEvents: 'none', zIndex: 2 };
  const inputStyle: React.CSSProperties = { width: '100%', height: '100%', paddingLeft: '45px', boxSizing: 'border-box', margin: 0 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', position: 'relative' }}>
      {toast && (
          <div className={`toast ${toast.type}`} style={{top: '20px', display: 'flex', alignItems: 'center', gap: 8}}>
              {toast.type === 'error' ? <AlertCircle size={20}/> : <CheckCircle size={20}/>}
              {toast.msg}
          </div>
      )}

      <div className="menu-card" style={{ maxWidth: '420px', width: '100%', padding: '40px', cursor: 'default', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '24px', boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.3)' }}>
        
        {/* --- CABEÇALHO --- */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <svg viewBox="0 0 200 200" width="80" height="80" xmlns="http://www.w3.org/2000/svg" style={{ margin: '0 auto 20px', color: 'var(--accent)', filter: 'drop-shadow(0 0 15px rgba(139, 92, 246, 0.7))' }}>
              <path fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" d="M20,100 C20,100 60,40 100,40 C140,40 180,100 180,100 C180,100 140,160 100,160 C60,160 20,100 20,100 Z M100,40 L100,20 M100,180 L100,160 M20,100 L10,100 M190,100 L180,100 M50,65 L40,55 M160,55 L150,65 M50,135 L40,145 M160,145 L150,135" />
              <path fill="none" stroke="white" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" d="M100,130 C116.568542,130 130,116.568542 130,100 C130,83.4314575 116.568542,70 100,70 C83.4314575,70 70,83.4314575 70,100 C70,116.568542 83.4314575,130 100,130 Z M100,110 C105.522847,110 110,105.522847 110,100 C110,94.4771525 105.522847,90 100,90 C94.4771525,90 90,94.4771525 90,100 C90,105.522847 94.4771525,110 100,110 Z M100,100 L130,100 M100,100 L70,100 M100,100 L100,70 M100,100 L100,130" />
          </svg>
          
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 700, marginBottom: '5px', letterSpacing: '-0.5px' }}>
            <span style={{ color: 'var(--accent)' }}>Argus</span><span style={{ color: 'white' }}>One</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            {isRecovery ? 'Recuperação de Acesso' : 
             awaitingVerification ? 'Verifique seu email' : 
             (isSignUp ? 'Crie sua identidade' : 'Identifique-se')}
          </p>
        </div>

        {/* --- FORMULÁRIOS --- */}
        {isRecovery ? (
          <form onSubmit={handleRecovery} style={{ display: 'flex', flexDirection: 'column' }}>
             <p style={{fontSize: '0.9rem', color: '#cbd5e1', textAlign: 'center', lineHeight: '1.5', marginBottom: '20px'}}>
               Confirme seus dados para receber o link de redefinição.
             </p>
             <div style={inputContainerStyle}><div style={iconWrapperStyle}><Mail size={18} /></div><input type="email" placeholder="Email cadastrado" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} /></div>
             <div style={inputContainerStyle}><div style={iconWrapperStyle}><Calendar size={18} /></div><input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required style={{...inputStyle, colorScheme: 'dark'}} /></div>
             <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '10px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', borderRadius: '12px', fontWeight: 600 }}>{loading ? <Loader2 className="spin-animation" size={20} /> : <>Enviar Link <ArrowRight size={18} /></>}</button>
             <button type="button" onClick={() => setIsRecovery(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '0.9rem', cursor: 'pointer', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}><ArrowLeft size={16} /> Voltar</button>
          </form>
        ) : awaitingVerification ? (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column' }}>
             <div style={inputContainerStyle}><div style={iconWrapperStyle}><KeyRound size={18} /></div><input type="text" inputMode="numeric" placeholder="Código (6 dígitos)" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} required style={{...inputStyle, letterSpacing: '4px', fontSize: '1.2rem', textAlign: 'center'}} maxLength={6} /></div>
             <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '10px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', borderRadius: '12px', fontWeight: 600 }}>{loading ? <Loader2 className="spin-animation" size={20} /> : <>Confirmar <CheckCircle size={18} /></>}</button>
             <button type="button" onClick={() => setAwaitingVerification(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '0.9rem', cursor: 'pointer', marginTop: '10px' }}>Voltar</button>
          </form>
        ) : (
          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column' }}>
            {isSignUp && (
              <>
                <div style={{...inputContainerStyle, animation: 'fadeIn 0.3s ease'}}><div style={iconWrapperStyle}><User size={18} /></div><input type="text" placeholder="Nome Completo" value={fullName} onChange={(e) => setFullName(e.target.value)} required={isSignUp} style={inputStyle} /></div>
                <div style={{...inputContainerStyle, animation: 'fadeIn 0.3s ease'}}><div style={iconWrapperStyle}><Calendar size={18} /></div><input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required={isSignUp} style={{...inputStyle, colorScheme: 'dark', color: birthDate ? 'white' : '#94a3b8'}} /></div>
              </>
            )}
            <div style={inputContainerStyle}><div style={iconWrapperStyle}><Mail size={18} /></div><input type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} /></div>
            <div style={inputContainerStyle}><div style={iconWrapperStyle}><Lock size={18} /></div><input type="password" placeholder="Sua senha" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} /></div>
            {!isSignUp && (
              <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '-10px', marginBottom: '15px'}}>
                <button type="button" onClick={() => { setIsRecovery(true); setBirthDate(''); }} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.85rem', cursor: 'pointer' }}>Esqueci minha senha</button>
              </div>
            )}
            {isSignUp && (
              <div style={{...inputContainerStyle, animation: 'fadeIn 0.3s ease'}}><div style={{...iconWrapperStyle, color: 'var(--accent)'}}><Lock size={18} /></div><input type="password" placeholder="Confirme sua senha" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required={isSignUp} style={{...inputStyle, borderColor: (confirmPassword && password !== confirmPassword) ? 'var(--danger)' : ''}} /></div>
            )}
            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '10px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', borderRadius: '12px', fontWeight: 600 }}>{loading ? <Loader2 className="spin-animation" size={20} /> : <>{isSignUp ? 'Continuar' : 'Acessar Sistema'} <ArrowRight size={18} /></>}</button>
          </form>
        )}

        {!awaitingVerification && !isRecovery && (
          <div style={{ textAlign: 'center', marginTop: '25px' }}>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{isSignUp ? 'Já tem uma conta?' : 'Ainda não tem acesso?'}</p>
            <button onClick={() => { setIsSignUp(!isSignUp); setToast(null); setConfirmPassword(''); setBirthDate(''); }} style={{ background: 'transparent', border: 'none', color: 'var(--accent)', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', marginTop: '5px' }}>
              {isSignUp ? 'Fazer Login' : 'Criar uma Conta'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}