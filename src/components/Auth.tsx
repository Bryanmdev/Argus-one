import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Loader2, Mail, Lock, User, ArrowRight, KeyRound, CheckCircle } from 'lucide-react';
import '../App.css';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  
  // Campos do Formulário
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); 
  const [fullName, setFullName] = useState(''); 
  const [otpCode, setOtpCode] = useState(''); 

  // Estados de Controle
  const [isSignUp, setIsSignUp] = useState(false); 
  const [awaitingVerification, setAwaitingVerification] = useState(false); 
  
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // --- 1. AÇÃO DE LOGIN OU CADASTRO ---
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          throw new Error("As senhas não coincidem.");
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        
        if (error) throw error;
        
        setAwaitingVerification(true);
        showToast('Código enviado! Verifique seu email.', 'success');

      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error: any) {
      showToast(error.message || 'Erro na autenticação', 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- 2. AÇÃO DE VERIFICAR CÓDIGO (OTP) ---
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: 'signup'
      });
      
      if (error) throw error;
      showToast('Conta verificada com sucesso!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Código inválido', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', position: 'relative' }}>
      {toast && <div className={`toast ${toast.type}`} style={{top: '20px'}}>{toast.msg}</div>}

      <div className="menu-card" style={{ maxWidth: '420px', width: '100%', padding: '40px', cursor: 'default', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '24px', boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.3)' }}>
        
        {/* --- CABEÇALHO (LOGO LIMPA) --- */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <svg viewBox="0 0 200 200" width="80" height="80" xmlns="http://www.w3.org/2000/svg" style={{ margin: '0 auto 20px', color: 'var(--accent)', filter: 'drop-shadow(0 0 15px rgba(139, 92, 246, 0.7))' }}>
              <path fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" d="M20,100 C20,100 60,40 100,40 C140,40 180,100 180,100 C180,100 140,160 100,160 C60,160 20,100 20,100 Z M100,40 L100,20 M100,180 L100,160 M20,100 L10,100 M190,100 L180,100 M50,65 L40,55 M160,55 L150,65 M50,135 L40,145 M160,145 L150,135" />
              <path fill="none" stroke="white" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" d="M100,130 C116.568542,130 130,116.568542 130,100 C130,83.4314575 116.568542,70 100,70 C83.4314575,70 70,83.4314575 70,100 C70,116.568542 83.4314575,130 100,130 Z M100,110 C105.522847,110 110,105.522847 110,100 C110,94.4771525 105.522847,90 100,90 C94.4771525,90 90,94.4771525 90,100 C90,105.522847 94.4771525,110 100,110 Z M100,100 L130,100 M100,100 L70,100 M100,100 L100,70 M100,100 L100,130" />
          </svg>
          
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 700, marginBottom: '5px', letterSpacing: '-0.5px' }}>
            <span style={{ color: 'var(--accent)' }}>Argus</span><span style={{ color: 'white' }}>One</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            {awaitingVerification 
              ? 'Verifique o código enviado ao email' 
              : (isSignUp ? 'Crie sua identidade segura' : 'Identifique-se para acessar')}
          </p>
        </div>

        {/* --- FORMULÁRIO --- */}
        {awaitingVerification ? (
          /* TELA DE VERIFICAÇÃO DE CÓDIGO (OTP) */
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
             <div style={{position: 'relative'}}>
                <KeyRound size={18} style={{position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: '#64748b'}} />
                <input 
                  type="text" 
                  inputMode="numeric" 
                  placeholder="Código de verificação" 
                  value={otpCode} 
                  onChange={(e) => setOtpCode(e.target.value)} 
                  required 
                  style={{paddingLeft: '45px', letterSpacing: '2px', fontSize: '1.1rem', textAlign: 'center'}} 
                  maxLength={8} /* AUMENTADO PARA 8 */
                />
            </div>
            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '10px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', borderRadius: '12px', fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
               {loading ? <Loader2 className="spin-animation" size={20} /> : <>Confirmar Código <CheckCircle size={18} /></>}
            </button>
            <button type="button" onClick={() => setAwaitingVerification(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '0.9rem', cursor: 'pointer', marginTop: '10px' }}>
               Voltar / Corrigir Email
            </button>
          </form>
        ) : (
          /* TELA DE LOGIN / CADASTRO */
          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {isSignUp && (
              <div style={{position: 'relative'}}>
                <User size={18} style={{position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: '#64748b'}} />
                <input type="text" placeholder="Nome Completo" value={fullName} onChange={(e) => setFullName(e.target.value)} required={isSignUp} style={{paddingLeft: '45px'}} />
              </div>
            )}
            
            <div style={{position: 'relative'}}>
              <Mail size={18} style={{position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: '#64748b'}} />
              <input type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required style={{paddingLeft: '45px'}} />
            </div>
            
            <div style={{position: 'relative'}}>
              <Lock size={18} style={{position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: '#64748b'}} />
              <input type="password" placeholder="Sua senha" value={password} onChange={(e) => setPassword(e.target.value)} required style={{paddingLeft: '45px'}} />
            </div>

            {isSignUp && (
              <div style={{position: 'relative', animation: 'fadeIn 0.3s ease'}}>
                <Lock size={18} style={{position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: 'var(--accent)'}} />
                <input 
                  type="password" 
                  placeholder="Confirme sua senha" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required={isSignUp}
                  style={{paddingLeft: '45px', borderColor: (confirmPassword && password !== confirmPassword) ? 'var(--danger)' : ''}} 
                />
              </div>
            )}
            
            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '10px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', borderRadius: '12px', fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
              {loading ? <Loader2 className="spin-animation" size={20} /> : <>{isSignUp ? 'Continuar' : 'Acessar Sistema'} <ArrowRight size={18} /></>}
            </button>
          </form>
        )}

        {!awaitingVerification && (
          <div style={{ textAlign: 'center', marginTop: '25px' }}>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{isSignUp ? 'Já tem uma conta?' : 'Ainda não tem acesso?'}</p>
            <button onClick={() => { setIsSignUp(!isSignUp); setToast(null); setConfirmPassword(''); }} style={{ background: 'transparent', border: 'none', color: 'var(--accent)', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', marginTop: '5px' }}>
              {isSignUp ? 'Fazer Login' : 'Criar uma Conta'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}