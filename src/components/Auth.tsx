import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Eye, EyeOff, User, Calendar, Mail } from 'lucide-react'; 
import '../App.css';

// Componente de Input (Mantido igual)
const PasswordInput = ({ value, onChange, placeholder, show, onToggle }: any) => (
  <div style={{ position: 'relative', width: '100%' }}>
    <input
      type={show ? "text" : "password"}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required
      minLength={6}
      style={{ paddingRight: '45px' }}
    />
    <button
      type="button"
      onClick={onToggle}
      style={{
        position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
        background: 'transparent', border: 'none', color: '#94a3b8', padding: '0',
        cursor: 'pointer', width: 'auto', height: 'auto', display: 'flex', alignItems: 'center'
      }}
      tabIndex={-1}
    >
      {show ? <EyeOff size={20} /> : <Eye size={20} />}
    </button>
  </div>
);

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true); 
  const [isVerifying, setIsVerifying] = useState(false); 
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [otpToken, setOtpToken] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 1. Início de Cadastro / Login
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      // --- LOGIN ---
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
      setLoading(false);
    } else {
      // --- CADASTRO ---
      if (password !== confirmPassword) {
        alert('❌ As senhas não coincidem!');
        setLoading(false);
        return; 
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            birth_date: birthDate,
          }
        }
      });

      if (error) {
        alert(error.message);
      } else {
        if (data.user && !data.session) {
          setIsVerifying(true); 
        } else if (data.session) {
          alert(`Bem-vindo, ${fullName}!`);
        }
      }
      setLoading(false);
    }
  };

  // 2. Verificar Código
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otpToken,
      type: 'signup'
    });

    if (error) {
      alert('❌ Código inválido: ' + error.message);
    } 
    // Se der certo, o App.tsx detecta o login sozinho
    setLoading(false);
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '400px', margin: '50px auto' }}>
        
        {/* CABEÇALHO */}
        <h2 style={{ textAlign: 'center' }}>
          {isVerifying ? '✉️ Verifique seu Email' : (isLogin ? '🔐 Acesso ao Cofre' : '🚀 Crie sua Conta')}
        </h2>
        
        <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '20px', fontSize: '0.9em' }}>
          {isVerifying 
            ? `Digite o código enviado para ${email}` 
            : (isLogin ? 'Entre com suas credenciais' : 'Dados de segurança')}
        </p>
        
        {/* TELA DE CÓDIGO */}
        {isVerifying ? (
          <form onSubmit={handleVerifyOtp} className="form-group">
            <div style={{ position: 'relative' }}>
              <Mail size={20} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Código de Verificação"
                value={otpToken}
                onChange={(e) => setOtpToken(e.target.value)}
                required
                maxLength={8} // <-- AUMENTADO PARA 8 DÍGITOS
                style={{ paddingLeft: '40px', letterSpacing: '3px', fontSize: '1.2em', textAlign: 'center' }}
                autoFocus 
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Validando...' : 'Confirmar Email'}
            </button>
            
            <button 
              type="button" 
              onClick={() => setIsVerifying(false)}
              style={{ background: 'transparent', border: 'none', color: '#ef4444', marginTop: '10px', fontSize: '0.9em' }}
            >
              Voltar / Corrigir Email
            </button>
          </form>
        ) : (
          
          /* TELA DE LOGIN / CADASTRO */
          <form onSubmit={handleAuth} className="form-group">
            {!isLogin && (
              <>
                <div style={{ position: 'relative' }}>
                  <User size={20} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
                  <input
                    type="text"
                    placeholder="Nome Completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
                
                <div style={{ position: 'relative' }}>
                  <Calendar size={20} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
                  <input
                    type="date"
                    placeholder="Data de Nascimento"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    required
                    style={{ paddingLeft: '40px', colorScheme: 'dark' }}
                  />
                </div>
              </>
            )}

            <input
              type="email"
              placeholder="Seu melhor email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <PasswordInput 
              placeholder={isLogin ? "Sua senha" : "Crie uma senha forte"}
              value={password}
              onChange={(e: any) => setPassword(e.target.value)}
              show={showPassword}
              onToggle={() => setShowPassword(!showPassword)}
            />
            
            {!isLogin && (
              <PasswordInput 
                placeholder="Confirme a senha"
                value={confirmPassword}
                onChange={(e: any) => setConfirmPassword(e.target.value)}
                show={showConfirmPassword}
                onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            )}
            
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Processando...' : (isLogin ? 'Entrar no Sistema' : 'Cadastrar Conta')}
            </button>
          </form>
        )}

        {!isVerifying && (
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setPassword('');
                setConfirmPassword('');
              }}
              style={{ 
                background: 'transparent', border: 'none', color: 'var(--accent)', 
                fontWeight: 'bold', cursor: 'pointer', padding: 0, display: 'inline', width: 'auto'
              }}
            >
              {isLogin ? 'Ainda não tem conta? Cadastre-se' : 'Já tem conta? Fazer Login'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}