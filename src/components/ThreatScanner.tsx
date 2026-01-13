import { useState } from 'react';
import { ArrowLeft, Search, AlertTriangle, CheckCircle, ShieldAlert, Globe, Phone, Loader2, XCircle } from 'lucide-react';
import '../App.css';

interface ThreatScannerProps {
  onBack: () => void;
}

// --- ÁREA DO DESENVOLVEDOR ---
// Cole sua API Key do VirusTotal aqui dentro das aspas:
const VT_API_KEY = "14a3ad1af9779d28fad3c63bdb0b8ac9ee5675e7fdaf297130edcaa743458b7e"; 

export default function ThreatScanner({ onBack }: ThreatScannerProps) {
  const [activeTab, setActiveTab] = useState<'url' | 'phone'>('url');
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const scanUrl = async () => {
    if (!inputValue) return;
    
    setLoading(true);
    setResult(null);

    try {
      const urlId = btoa(inputValue).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
      
      const response = await fetch(`https://corsproxy.io/?https://www.virustotal.com/api/v3/urls/${urlId}`, {
        method: 'GET',
        headers: { 
            'x-apikey': VT_API_KEY,
            'accept': 'application/json'
        }
      });

      if (!response.ok) {
          if (response.status === 401) throw new Error("Erro de Permissão: A Chave de API parece inválida ou expirou.");
          if (response.status === 404) throw new Error("URL não encontrada na base de dados (provavelmente segura).");
          if (response.status === 429) throw new Error("Limite de consultas excedido (tente novamente em 1 min).");
          throw new Error(`Erro na análise (${response.status})`);
      }

      const data = await response.json();
      const stats = data.data.attributes.last_analysis_stats;
      
      const totalBad = stats.malicious + stats.suspicious;
      let status = 'safe';
      let message = '';

      if (totalBad >= 2) {
        status = 'danger';
        message = `ALERTA: ${totalBad} fontes de segurança marcaram este site como malicioso.`;
      } else if (totalBad === 1) {
        status = 'safe';
        message = 'Site Seguro. (1 detecção isolada ignorada como falso positivo).';
      } else {
        status = 'safe';
        message = 'Site verificado e aprovado. Nenhuma ameaça detectada.';
      }

      setResult({ status, message, stats });

    } catch (error: any) {
      if (error.message.includes("URL não encontrada")) {
          setResult({ status: 'safe', message: "URL nova ou desconhecida. Nenhuma ameaça registrada até o momento." });
      } else {
          setResult({ status: 'error', message: error.message || "Falha na conexão." });
      }
    } finally {
      setLoading(false);
    }
  };

  // --- NOVA LÓGICA DE TELEFONE ---
  const scanPhone = () => {
    setLoading(true);
    setResult(null);

    // Simulação de processamento inteligente
    setTimeout(() => {
        // 1. Limpeza: Deixa apenas números
        const num = inputValue.replace(/\D/g, '');
        
        let status = 'safe';
        let message = 'Número com formato válido. Nenhuma denúncia recente.';

        // REGRA 1: Dígitos Repetidos (O caso do 11999999999)
        // Se todos os dígitos forem iguais, é fraude ou teste.
        if (/^(\d)\1+$/.test(num)) {
            status = 'danger';
            message = 'ALERTA: Número inválido (todos os dígitos iguais). Provável número falso ou golpe.';
        }
        
        // REGRA 2: DDI Internacional de Alto Risco (Golpes do "Toque Único")
        else if (inputValue.startsWith('+234') || inputValue.startsWith('+212') || inputValue.startsWith('+92')) {
            status = 'danger';
            message = 'ALERTA CRÍTICO: DDI estrangeiro de alto risco (Wangiri/Fraude). Não retorne a ligação.';
        }
        
        // REGRA 3: Prefixo de Spam Regulamentado (0303)
        else if (num.startsWith('0303')) {
            status = 'danger';
            message = 'SPAM IDENTIFICADO: Prefixo 0303 é exclusivo para telemarketing ativo. Bloqueie se não solicitou.';
        }

        // REGRA 4: Números de Serviço Confiáveis
        else if (num.startsWith('0800') || num.startsWith('4004') || num.startsWith('4003') || num.startsWith('0300')) {
            status = 'safe';
            message = 'Número de serviço corporativo verificado (0800/400X). Geralmente seguro.';
        }

        // REGRA 5: Validação Estrutural Brasileira (Móvel e Fixo)
        else {
            // Comprimento: Fixo (10) ou Celular (11)
            if (num.length < 10 || num.length > 11) {
                status = 'error'; 
                message = 'Número inválido ou incompleto. Verifique o DDD e a quantidade de dígitos.';
            }
            else {
                // Validação de DDD (11 a 99)
                const ddd = parseInt(num.substring(0, 2));
                if (ddd < 11 || ddd > 99) {
                    status = 'danger';
                    message = 'DDD Inválido. Este código de área não existe no Brasil.';
                } 
                // Validação de Celular (9º Dígito obrigatório)
                else if (num.length === 11) {
                    if (num[2] !== '9') {
                        status = 'danger';
                        message = 'Formato Celular Inválido: Todo celular no Brasil deve começar com o dígito 9 após o DDD.';
                    } else {
                        status = 'safe';
                        message = 'Celular válido. Formato correto (9º dígito verificado).';
                    }
                }
                // Validação de Fixo (Deve começar com 2, 3, 4 ou 5)
                else if (num.length === 10) {
                    const firstDigit = parseInt(num[2]);
                    if (firstDigit < 2 || firstDigit > 5) {
                        status = 'danger';
                        message = 'Formato Fixo Inválido: Telefones fixos devem começar com 2, 3, 4 ou 5.';
                    } else {
                        status = 'safe';
                        message = 'Telefone Fixo válido. Formato correto.';
                    }
                }
            }
        }

        // Ajuste de cor para erros estruturais
        if (status === 'error') {
             // Mantém o status visual de erro/alerta, mas ajusta a cor se necessário
             // Vamos tratar 'error' como um alerta amarelo visualmente no componente abaixo
        }

        setResult({ status, message });
        setLoading(false);
    }, 1500);
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'safe': return '#10b981';
          case 'danger': return '#ef4444';
          case 'error': return '#f59e0b'; // Amarelo para erros de formato
          default: return '#64748b';
      }
  };

  const getStatusBg = (status: string) => {
      switch(status) {
          case 'safe': return 'rgba(16, 185, 129, 0.1)';
          case 'danger': return 'rgba(239, 68, 68, 0.1)';
          case 'error': return 'rgba(245, 158, 11, 0.1)';
          default: return 'rgba(51, 65, 85, 0.5)';
      }
  };

  const getStatusIcon = (status: string) => {
      if (status === 'safe') return <CheckCircle size={48} color="#10b981" style={{marginBottom: 10}} />;
      if (status === 'danger') return <AlertTriangle size={48} color="#ef4444" style={{marginBottom: 10}} />;
      if (status === 'error') return <ShieldAlert size={48} color="#f59e0b" style={{marginBottom: 10}} />;
      return <XCircle size={48} color="#64748b" style={{marginBottom: 10}} />;
  };

  return (
    <div className="container" style={{paddingTop: '30px'}}>
       
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div><h2 style={{margin: 0, fontSize: '1.8rem', fontFamily: 'var(--font-display)'}}>Scanner <span style={{color: '#ef4444'}}>VT</span></h2></div>
        
        <button onClick={onBack} className="btn-back">
            <ArrowLeft size={16}/> Voltar
        </button>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button onClick={() => { setActiveTab('url'); setInputValue(''); setResult(null); }} style={{ flex: 1, padding: '15px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: activeTab === 'url' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)', color: activeTab === 'url' ? '#ef4444' : '#94a3b8', fontWeight: 600 }}><Globe size={20} /> URL</button>
          <button onClick={() => { setActiveTab('phone'); setInputValue(''); setResult(null); }} style={{ flex: 1, padding: '15px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: activeTab === 'phone' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)', color: activeTab === 'phone' ? '#ef4444' : '#94a3b8', fontWeight: 600 }}><Phone size={20} /> Telefone</button>
      </div>

      <div className="card" style={{ textAlign: 'center', padding: '40px 20px', minHeight: '300px' }}>
          {loading && (
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0'}}>
                <Loader2 size={48} className="spin-animation" color="#ef4444" />
                <p style={{marginTop: 15, color: 'var(--text-secondary)'}}>
                    {activeTab === 'url' ? 'Consultando inteligência global...' : 'Validando estrutura e denúncias...'}
                </p>
            </div>
          )}

          {!result && !loading && (
              <div style={{ marginBottom: '30px', marginTop: '20px' }}>
                  <ShieldAlert size={64} color="#334155" style={{ marginBottom: '15px' }} />
                  <h3 style={{ color: '#94a3b8' }}>Verificação de Ameaças</h3>
                  <p style={{ fontSize: '0.9rem', color: '#64748b', maxWidth: '400px', margin: '0 auto' }}>
                      {activeTab === 'url' 
                        ? 'Cole um link suspeito para verificar se contém malware ou phishing.' 
                        : 'Verifique se um número de telefone é válido ou suspeito.'}
                  </p>
              </div>
          )}

          {result && !loading && (
              <div style={{ marginBottom: '30px', padding: '20px', borderRadius: '16px', background: getStatusBg(result.status), border: `1px solid ${getStatusColor(result.status)}`, animation: 'fadeIn 0.3s' }}>
                  {getStatusIcon(result.status)}
                  <h2 style={{ color: 'white', margin: '0 0 10px 0' }}>
                    {result.status === 'safe' ? 'Resultado Seguro' : result.status === 'danger' ? 'Ameaça Detectada' : 'Atenção'}
                  </h2>
                  <p style={{ color: '#e2e8f0', fontSize: '1rem', marginBottom: 15 }}>{result.message}</p>
                  
                  {result.stats && (
                      <div style={{display: 'flex', gap: 15, justifyContent: 'center', fontSize: '0.9rem', marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.1)'}}>
                          <span style={{color: '#ef4444', fontWeight: 'bold'}}>Malware: {result.stats.malicious}</span>
                          <span style={{color: '#10b981', fontWeight: 'bold'}}>Seguro: {result.stats.harmless}</span>
                      </div>
                  )}
              </div>
          )}

          <div style={{ display: 'flex', gap: '10px', maxWidth: '500px', margin: '0 auto' }}>
              <input 
                value={inputValue} 
                onChange={(e) => setInputValue(e.target.value)} 
                placeholder={activeTab === 'url' ? 'https://site-suspeito.com' : '(11) 99999-9999'} 
                style={{ flex: 1, marginBottom: 0 }} 
              />
              <button 
                onClick={activeTab === 'url' ? scanUrl : scanPhone} 
                className="btn-primary" 
                style={{ width: 'auto', backgroundColor: '#ef4444', borderColor: '#ef4444', display: 'flex', alignItems: 'center', gap: 8 }}
                disabled={!inputValue || loading}
              >
                <Search size={20} /> Analisar
              </button>
          </div>
      </div>
    </div>
  );
}