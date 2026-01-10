import { useState } from 'react';
import CryptoJS from 'crypto-js';
import { Search, ShieldAlert, ShieldCheck, ArrowLeft, Lock, Mail, Loader2, AlertTriangle, Database, WifiOff, ExternalLink } from 'lucide-react';
import '../App.css';

interface LeakRadarProps {
  onBack: () => void;
}

export default function LeakRadar({ onBack }: LeakRadarProps) {
  const [activeTab, setActiveTab] = useState<'password' | 'email'>('password');
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [result, setResult] = useState<{ 
      status: 'leaked' | 'safe' | 'error'; 
      count?: number; 
      message: string;
      breaches?: string[];
      source?: string;
  } | null>(null);

  // --- 1. SENHAS (HIBP - Gratuito e Seguro) ---
  const checkPasswordLeak = async (password: string) => {
    if (!password) return;
    setLoading(true);
    setResult(null);

    try {
      const sha1Hash = CryptoJS.SHA1(password).toString(CryptoJS.enc.Hex).toUpperCase();
      const prefix = sha1Hash.substring(0, 5);
      const suffix = sha1Hash.substring(5);

      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
      if (!response.ok) throw new Error("Erro API Senha");
      
      const text = await response.text();
      const lines = text.split('\n');
      const match = lines.find(line => line.startsWith(suffix));

      if (match) {
        const count = parseInt(match.split(':')[1]);
        setResult({
          status: 'leaked',
          count: count,
          message: `Essa senha apareceu em ${count.toLocaleString()} vazamentos.`
        });
      } else {
        setResult({
          status: 'safe',
          message: 'Senha não encontrada na base de dados pública.'
        });
      }
    } catch (error) {
      setResult({ status: 'error', message: 'Erro ao verificar senha.' });
    } finally {
      setLoading(false);
    }
  };

  // --- 2. E-MAIL (XposedOrNot + Pastes + Proxies) ---
  const checkEmailLeak = async (rawEmail: string) => {
      const email = rawEmail.trim().toLowerCase();
      if (!email || !email.includes('@')) {
          alert("E-mail inválido.");
          return;
      }

      setLoading(true);
      setResult(null);

      // Adicionamos um timestamp para impedir que o proxy te entregue um resultado velho (cache)
      const cacheBuster = `&_t=${Date.now()}`;
      const targetUrl = `https://api.xposedornot.com/v1/check-email/${encodeURIComponent(email)}`;

      // Lista de Proxies para tentar em ordem (Resiliência)
      // O 'CodeTabs' e 'AllOrigins' costumam ser os mais confiáveis para JSON
      const proxies = [
          `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}${cacheBuster}`, 
          `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}${cacheBuster}`,
          `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`
      ];

      let success = false;

      for (const proxy of proxies) {
          try {
              console.log(`Buscando em: ${proxy}`);
              const response = await fetch(proxy);
              
              // 404 = Seguro (Email não existe na base)
              if (response.status === 404) {
                  setResult({
                      status: 'safe',
                      message: 'Não encontramos registros de vazamento para este e-mail.'
                  });
                  success = true;
                  break; 
              } 
              
              // 200 = Vazado (Email encontrado)
              else if (response.ok) {
                  const data = await response.json();
                  
                  // NORMALIZAÇÃO DOS DADOS
                  // O XposedOrNot retorna 'Breaches' (Bancos de dados) e 'Pastes' (Textos soltos na web)
                  // Vamos somar os dois para bater com o número do site oficial.
                  
                  const breachesList = data.Breaches || data.breaches || [];
                  const pastesList = data.Pastes || data.pastes || [];

                  const allBreachesNames: string[] = [];

                  // Processa Vazamentos de Banco de Dados
                  if (Array.isArray(breachesList)) {
                      breachesList.forEach((b: any) => {
                          // A API retorna arrays [[Nome, ...], [Nome, ...]]
                          if (Array.isArray(b)) allBreachesNames.push(b[0]);
                          else if (typeof b === 'string') allBreachesNames.push(b);
                      });
                  }

                  // Processa Pastes (Colas de texto) - Opcional mas aumenta a precisão
                  if (Array.isArray(pastesList)) {
                      pastesList.forEach((p: any) => {
                          // Pastes também podem vir como arrays ou objetos dependendo da versão da API
                          if (Array.isArray(p)) allBreachesNames.push(`Paste: ${p[0] || 'Desconhecido'}`);
                          else if (typeof p === 'string') allBreachesNames.push(`Paste: ${p}`);
                      });
                  }

                  if (allBreachesNames.length > 0) {
                      setResult({
                          status: 'leaked',
                          count: allBreachesNames.length,
                          message: `ALERTA: E-mail encontrado em ${allBreachesNames.length} fontes de vazamento.`,
                          breaches: allBreachesNames
                      });
                      success = true;
                      break;
                  } else {
                      // Se deu 200 mas as listas estão vazias
                      setResult({ status: 'safe', message: 'E-mail limpo.' });
                      success = true;
                      break;
                  }
              }
          } catch (e) {
              console.warn("Proxy falhou, tentando próximo...", e);
          }
      }

      if (!success) {
          setResult({ 
              status: 'error', 
              message: 'Bloqueio de segurança detectado. Use o botão abaixo para verificar no site oficial.' 
          });
      }
      
      setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'password') checkPasswordLeak(inputValue);
    else checkEmailLeak(inputValue);
  };

  const renderResultCard = () => {
      if (!result) return null;

      let color = '#10b981'; // Verde
      let icon = <ShieldCheck size={32} color={color} />;
      let title = 'TUDO SEGURO';
      let bg = 'rgba(16, 185, 129, 0.1)';

      if (result.status === 'leaked') {
          color = '#ef4444'; // Vermelho
          icon = <AlertTriangle size={32} color={color} />;
          title = activeTab === 'password' ? 'SENHA VAZADA' : 'E-MAIL VAZADO';
          bg = 'rgba(239, 68, 68, 0.1)';
      } else if (result.status === 'error') {
          color = '#f59e0b'; // Amarelo
          icon = <WifiOff size={32} color={color} />;
          title = 'ERRO DE CONEXÃO';
          bg = 'rgba(245, 158, 11, 0.1)';
      }

      return (
        <div style={{ marginTop: '30px', textAlign: 'left', animation: 'fadeIn 0.5s ease' }}>
            <div style={{ padding: '20px', borderRadius: '12px', background: bg, border: `1px solid ${color}`, textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                    {icon}
                    <strong style={{ fontSize: '1.2rem', color: color }}>{title}</strong>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{result.message}</p>
                </div>
            </div>

            {/* Link Oficial (Sempre útil para confirmar) */}
            {activeTab === 'email' && (
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <a 
                        href="https://xposedornot.com/" 
                        target="_blank" 
                        rel="noreferrer"
                        className="btn-primary"
                        style={{ 
                            background: 'transparent', border: '1px solid var(--border)', 
                            color: 'var(--text-color)', width: 'auto', display: 'inline-flex', 
                            gap: 8, padding: '8px 16px', fontSize: '0.9rem' 
                        }}
                    >
                        Confirmar no Site Oficial <ExternalLink size={14} />
                    </a>
                </div>
            )}

            {result.status === 'leaked' && result.breaches && (
                <div style={{ background: 'var(--input-bg)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <h4 style={{ margin: '0 0 15px 0', color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Database size={16} /> FONTES DOS VAZAMENTOS:
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {result.breaches.map((breach, idx) => (
                            <span key={idx} style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', color: 'var(--text-color)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem' }}>
                                {breach}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
      );
  };

  return (
    <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
           <h2 style={{ margin: 0, fontSize: '1.8rem', fontFamily: 'var(--font-display)', color: 'var(--text-color)' }}>Leak <span style={{ color: '#ef4444' }}>Radar</span></h2>
           <p style={{ color: 'var(--text-secondary)' }}>Monitoramento de Vazamentos</p>
        </div>
        <button onClick={onBack} style={{ width: 'auto', flex: 'none', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '8px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.9rem' }}>
            <ArrowLeft size={16} /> Voltar
        </button>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button onClick={() => { setActiveTab('password'); setResult(null); setInputValue(''); }} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: activeTab === 'password' ? 'var(--primary-light)' : 'rgba(255,255,255,0.05)', color: activeTab === 'password' ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Lock size={18} /> Verificar Senha
          </button>
          <button onClick={() => { setActiveTab('email'); setResult(null); setInputValue(''); }} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: activeTab === 'email' ? 'var(--primary-light)' : 'rgba(255,255,255,0.05)', color: activeTab === 'email' ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Mail size={18} /> Verificar E-mail
          </button>
      </div>

      <div className="card" style={{ padding: '40px 25px', textAlign: 'center' }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: activeTab === 'password' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
             {activeTab === 'password' ? <ShieldAlert size={30} color="#ef4444" /> : <Search size={30} color="#3b82f6" />}
          </div>
          
          <h3 style={{ fontSize: '1.4rem', marginBottom: 10, color: 'var(--text-color)' }}>
            {activeTab === 'password' ? 'Sua senha está segura?' : 'Seu e-mail vazou?'}
          </h3>
          
          <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 30px', fontSize: '0.9rem', lineHeight: '1.5' }}>
            {activeTab === 'password' 
                ? 'Sua senha é verificada usando k-Anonymity e nunca deixa seu dispositivo.'
                : 'Verificamos a base de dados pública do XposedOrNot.'}
          </p>

          <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto' }}>
             <div style={{ position: 'relative', marginBottom: '20px' }}>
                <input 
                    type={activeTab === 'password' ? 'password' : 'email'} 
                    placeholder={activeTab === 'password' ? 'Digite uma senha...' : 'email@exemplo.com'}
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
                {loading ? <Loader2 className="spin-animation" /> : 'Verificar Agora'}
             </button>
          </form>

          {renderResultCard()}
      </div>

      <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
         Dados fornecidos por fontes públicas de segurança.
      </div>

    </div>
  );
}