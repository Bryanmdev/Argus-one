import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Loader2, Mail, Lock, User, ArrowRight, KeyRound, CheckCircle, ArrowLeft, Calendar } from 'lucide-react';
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
    setTimeout(() => setToast(null), 4000);
  };

  // --- LÓGICA DE AUTENTICAÇÃO (MANTIDA) ---
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        if (password !== confirmPassword) throw new Error("As senhas não coincidem.");
        if (!birthDate) throw new Error("A data de nascimento é obrigatória.");

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName, birth_date: birthDate } },
        });
        if (error) throw error;
        setAwaitingVerification(true);
        showToast('Código enviado! Verifique seu email.', 'success');
      } else {
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
      if (!birthDate) throw new Error("Confirme a data de nascimento.");

      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
      if (error) throw error;
      showToast('Link enviado!', 'success');
      setIsRecovery(false); 
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- ESTILOS DE CORREÇÃO VISUAL ---
  
  // Container do Input: Garante que o input e o ícone fiquem no mesmo contexto
  const inputContainerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '48px', // Altura fixa para o container
    marginBottom: '15px'
  };

  // Wrapper do Ícone: Uma caixa invisível à esquerda, com altura total (100%)
  // O Flexbox centraliza o ícone lá dentro automaticamente.
  const iconWrapperStyle: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%', // Ocupa toda a altura do input
    width: '45px',  // Mesma largura do padding do input
    display: 'flex',
    alignItems: 'center', // Centraliza verticalmente
    justifyContent: 'center', // Centraliza horizontalmente
    color: '#64748b',
    pointerEvents: 'none', // O clique passa direto para o input
    zIndex: 2
  };

  // O Input em si
  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: '100%', // Preenche a altura fixa de 48px
    paddingLeft: '45px', // Espaço para o ícone
    boxSizing: 'border-box',
    margin: 0 // Remove margens padrão que desalinham
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', position: 'relative' }}>
      {toast && <div className={`toast ${toast.type}`} style={{top: '20px'}}>{toast.msg}</div>}

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
        
        {/* 1. TELA DE RECUPERAÇÃO DE SENHA */}
        {isRecovery ? (
          <form onSubmit={handleRecovery} style={{ display: 'flex', flexDirection: 'column' }}>
             <p style={{fontSize: '0.9rem', color: '#cbd5e1', textAlign: 'center', lineHeight: '1.5', marginBottom: '20px'}}>
               Confirme seus dados para receber o link.
             </p>
             
             <div style={inputContainerStyle}>
                <div style={iconWrapperStyle}><Mail size={18} /></div>
                <input type="email" placeholder="Email cadastrado" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
            </div>

            <div style={inputContainerStyle}>
                <div style={iconWrapperStyle}><Calendar size={18} /></div>
                <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required style={{...inputStyle, colorScheme: 'dark'}} />
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '10px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', borderRadius: '12px', fontWeight: 600 }}>
               {loading ? <Loader2 className="spin-animation" size={20} /> : <>Validar e Enviar <ArrowRight size={18} /></>}
            </button>
            <button type="button" onClick={() => setIsRecovery(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '0.9rem', cursor: 'pointer', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
               <ArrowLeft size={16} /> Voltar
            </button>
          </form>

        ) : awaitingVerification ? (
          /* 2. TELA DE CÓDIGO (OTP) */
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column' }}>
             <div style={inputContainerStyle}>
                <div style={iconWrapperStyle}><KeyRound size={18} /></div>
                <input type="text" inputMode="numeric" placeholder="Código" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} required style={{...inputStyle, letterSpacing: '2px', fontSize: '1.1rem', textAlign: 'center'}} maxLength={8} />
            </div>
            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '10px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', borderRadius: '12px', fontWeight: 600 }}>
               {loading ? <Loader2 className="spin-animation" size={20} /> : <>Confirmar <CheckCircle size={18} /></>}
            </button>
            <button type="button" onClick={() => setAwaitingVerification(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '0.9rem', cursor: 'pointer', marginTop: '10px' }}>Voltar</button>
          </form>

        ) : (
          /* 3. TELA PRINCIPAL (LOGIN/CADASTRO) */
          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column' }}>
            {isSignUp && (
              <>
                <div style={{...inputContainerStyle, animation: 'fadeIn 0.3s ease'}}>
                  <div style={iconWrapperStyle}><User size={18} /></div>
                  <input type="text" placeholder="Nome Completo" value={fullName} onChange={(e) => setFullName(e.target.value)} required={isSignUp} style={inputStyle} />
                </div>
                
                <div style={{...inputContainerStyle, animation: 'fadeIn 0.3s ease'}}>
                  <div style={iconWrapperStyle}><Calendar size={18} /></div>
                  <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required={isSignUp} style={{...inputStyle, colorScheme: 'dark', color: birthDate ? 'white' : '#94a3b8'}} />
                </div>
              </>
            )}
            
            <div style={inputContainerStyle}>
              <div style={iconWrapperStyle}><Mail size={18} /></div>
              <input type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
            </div>
            
            <div style={inputContainerStyle}>
              <div style={iconWrapperStyle}><Lock size={18} /></div>
              <input type="password" placeholder="Sua senha" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
            </div>

            {!isSignUp && (
              <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '-10px', marginBottom: '15px'}}>
                <button type="button" onClick={() => { setIsRecovery(true); setBirthDate(''); }} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.85rem', cursor: 'pointer' }}>
                  Esqueci minha senha
                </button>
              </div>
            )}

            {isSignUp && (
              <div style={{...inputContainerStyle, animation: 'fadeIn 0.3s ease'}}>
                <div style={{...iconWrapperStyle, color: 'var(--accent)'}}><Lock size={18} /></div>
                <input type="password" placeholder="Confirme sua senha" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required={isSignUp} style={{...inputStyle, borderColor: (confirmPassword && password !== confirmPassword) ? 'var(--danger)' : ''}} />
              </div>
            )}
            
            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '10px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', borderRadius: '12px', fontWeight: 600 }}>
              {loading ? <Loader2 className="spin-animation" size={20} /> : <>{isSignUp ? 'Continuar' : 'Acessar Sistema'} <ArrowRight size={18} /></>}
            </button>
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