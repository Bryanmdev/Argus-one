import { useState } from 'react';
import CryptoJS from 'crypto-js';
import { Search, ShieldAlert, ShieldCheck, ArrowRight, ArrowLeft, Lock, Mail, Loader2, AlertTriangle, Database } from 'lucide-react';
import '../App.css';

interface LeakRadarProps {
  onBack: () => void;
}

export default function LeakRadar({ onBack }: LeakRadarProps) {
  const [activeTab, setActiveTab] = useState<'password' | 'email'>('password');
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Estado para armazenar resultados detalhados
  const [result, setResult] = useState<{ 
      leaked: boolean; 
      count?: number; 
      message: string;
      breaches?: string[]; // Lista dos vazamentos (para e-mail)
  } | null>(null);

  // --- 1. VERIFICAÇÃO DE SENHA (k-Anonymity) ---
  const checkPasswordLeak = async (password: string) => {
    if (!password) return;
    setLoading(true);
    setResult(null);

    try {
      const sha1Hash = CryptoJS.SHA1(password).toString(CryptoJS.enc.Hex).toUpperCase();
      const prefix = sha1Hash.substring(0, 5);
      const suffix = sha1Hash.substring(5);

      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
      const text = await response.text();

      const lines = text.split('\n');
      const match = lines.find(line => line.startsWith(suffix));

      if (match) {
        const count = parseInt(match.split(':')[1]);
        setResult({
          leaked: true,
          count: count,
          message: `Essa senha apareceu em ${count.toLocaleString()} vazamentos de dados conhecidos.`
        });
      } else {
        setResult({
          leaked: false,
          message: 'Essa senha não foi encontrada em bancos de dados públicos de hackers.'
        });
      }
    } catch (error) {
      setResult({ leaked: false, message: 'Erro de conexão. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  // --- 2. VERIFICAÇÃO DE E-MAIL (API XposedOrNot) ---
  const checkEmailLeak = async (email: string) => {
      if (!email || !email.includes('@')) {
          alert("Digite um e-mail válido.");
          return;
      }
      setLoading(true);
      setResult(null);

      try {
          // Usa a API do XposedOrNot que permite consulta direta gratuita
          const response = await fetch(`https://api.xposedornot.com/v1/check-email/${email}`);
          
          if (response.status === 404) {
              // 404 significa que NÃO foi encontrado (Seguro)
              setResult({
                  leaked: false,
                  message: 'Nenhum vazamento associado a este e-mail foi encontrado nos nossos registros.'
              });
          } else {
              const data = await response.json();
              // Se tiver dados, retorna um objeto onde "Breaches" é um array [ [nome, ...], ... ]
              if (data.Breaches && data.Breaches.length > 0) {
                  const breachList = data.Breaches[0]; // A API retorna um array aninhado
                  setResult({
                      leaked: true,
                      count: breachList.length,
                      message: `Encontramos seu e-mail em ${breachList.length} vazamentos de dados.`,
                      breaches: breachList
                  });
              } else {
                  // Caso retorne 200 mas sem lista (raro, mas possível)
                  setResult({ leaked: false, message: 'E-mail limpo. Nenhum registro encontrado.' });
              }
          }
      } catch (error) {
          console.error(error);
          setResult({ leaked: false, message: 'Erro ao conectar ao servidor de verificação.' });
      } finally {
          setLoading(false);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'password') {
        checkPasswordLeak(inputValue);
    } else {
        checkEmailLeak(inputValue);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
           <h2 style={{ margin: 0, fontSize: '1.8rem', fontFamily: 'var(--font-display)', color: 'var(--text-color)' }}>Leak <span style={{ color: '#ef4444' }}>Radar</span></h2>
           <p style={{ color: 'var(--text-secondary)' }}>Monitoramento de Vazamentos Globais</p>
        </div>
        
        {/* BOTÃO CORRIGIDO (Pequeno e não estica) */}
        <button 
            onClick={onBack} 
            style={{ 
                background: 'transparent', 
                border: '1px solid var(--border)', 
                color: 'var(--text-secondary)', 
                padding: '8px 12px', 
                borderRadius: '8px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                cursor: 'pointer',
                width: 'auto',      // Força largura automática
                flex: 'none',       // Impede expansão
                fontSize: '0.9rem'
            }}
        >
            <ArrowLeft size={16} /> Voltar
        </button>
      </div>

      {/* ABAS */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button onClick={() => { setActiveTab('password'); setResult(null); setInputValue(''); }} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: activeTab === 'password' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)', color: activeTab === 'password' ? '#ef4444' : 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Lock size={18} /> Verificar Senha
          </button>
          <button onClick={() => { setActiveTab('email'); setResult(null); setInputValue(''); }} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: activeTab === 'email' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.05)', color: activeTab === 'email' ? '#3b82f6' : 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Mail size={18} /> Verificar E-mail
          </button>
      </div>

      {/* CARTÃO DE BUSCA */}
      <div className="card" style={{ padding: '40px 25px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: activeTab === 'password' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
             {activeTab === 'password' ? <ShieldAlert size={30} color="#ef4444" /> : <Search size={30} color="#3b82f6" />}
          </div>
          
          <h3 style={{ fontSize: '1.4rem', marginBottom: 10, color: 'var(--text-color)' }}>
            {activeTab === 'password' ? 'Essa senha já vazou?' : 'Seu e-mail está comprometido?'}
          </h3>
          
          <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 30px', fontSize: '0.9rem', lineHeight: '1.5' }}>
            {activeTab === 'password' 
                ? 'Sua senha NUNCA é enviada. Usamos a técnica k-Anonymity para consultar o banco de dados sem expor seus dados.'
                : 'Verifique se seu endereço de e-mail apareceu em grandes vazamentos de dados globais (Ex: LinkedIn, Adobe, Canva).'}
          </p>

          <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto' }}>
             <div style={{ position: 'relative', marginBottom: '20px' }}>
                <input 
                    type={activeTab === 'password' ? 'password' : 'email'} 
                    placeholder={activeTab === 'password' ? 'Digite uma senha para testar...' : 'exemplo@email.com'}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    required
                    style={{ width: '100%', padding: '15px 15px 15px 45px', borderRadius: '12px', background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-color)', fontSize: '1rem' }}
                />
                <div style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', opacity: 0.5, color: 'var(--text-secondary)' }}>
                    {activeTab === 'password' ? <Lock size={20} /> : <Mail size={20} />}
                </div>
             </div>
             
             <button disabled={loading || !inputValue} className="btn-primary" style={{ width: '100%', height: '50px', fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
                {loading ? <Loader2 className="spin-animation" /> : (
                    <>{activeTab === 'password' ? 'Testar Segurança' : 'Consultar Base de Dados'} <ArrowRight size={18} /></>
                )}
             </button>
          </form>

          {/* RESULTADOS */}
          {result && (
              <div style={{ marginTop: '30px', textAlign: 'left', animation: 'fadeIn 0.5s ease' }}>
                  
                  {/* CARD PRINCIPAL DO RESULTADO */}
                  <div style={{ padding: '20px', borderRadius: '12px', background: result.leaked ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', border: `1px solid ${result.leaked ? '#ef4444' : '#10b981'}`, textAlign: 'center', marginBottom: '20px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                          {result.leaked ? <AlertTriangle size={32} color="#ef4444" /> : <ShieldCheck size={32} color="#10b981" />}
                          <strong style={{ fontSize: '1.2rem', color: result.leaked ? '#fca5a5' : '#86efac' }}>
                              {result.leaked ? (activeTab === 'password' ? 'VULNERABILIDADE CRÍTICA' : 'E-MAIL ENCONTRADO') : 'TUDO SEGURO'}
                          </strong>
                          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{result.message}</p>
                      </div>
                  </div>

                  {/* LISTA DE VAZAMENTOS (APENAS PARA E-MAIL E SE TIVER VAZADO) */}
                  {activeTab === 'email' && result.leaked && result.breaches && (
                      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px' }}>
                          <h4 style={{ margin: '0 0 15px 0', color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                              <Database size={16} /> FONTES DOS VAZAMENTOS:
                          </h4>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {result.breaches.map((breach, idx) => (
                                  <span key={idx} style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem' }}>
                                      {breach}
                                  </span>
                              ))}
                          </div>
                      </div>
                  )}

              </div>
          )}
      </div>

      <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
         Dados fornecidos por fontes públicas de segurança (HIBP & XposedOrNot).
      </div>

    </div>
  );
}