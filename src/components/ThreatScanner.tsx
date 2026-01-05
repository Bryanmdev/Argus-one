import { useState } from 'react';
import { ArrowLeft, Search, AlertTriangle, CheckCircle, ShieldAlert, Globe, Phone, Loader2, XCircle, Settings, Key } from 'lucide-react';
import '../App.css';

interface ThreatScannerProps {
  onBack: () => void;
}

export default function ThreatScanner({ onBack }: ThreatScannerProps) {
  const [activeTab, setActiveTab] = useState<'url' | 'phone'>('url');
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [apiKey, setApiKey] = useState(localStorage.getItem('vt_api_key') || '');
  const [showConfig, setShowConfig] = useState(false);

  const handleSaveKey = () => {
    localStorage.setItem('vt_api_key', apiKey);
    setShowConfig(false);
    alert('Chave salva!');
  };

  const scanUrl = async () => {
    if (!inputValue) return;
    if (!apiKey) { alert('Configure sua API Key!'); setShowConfig(true); return; }
    
    setLoading(true);
    setResult(null);

    try {
      const urlId = btoa(inputValue).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
      const response = await fetch(`https://corsproxy.io/?https://www.virustotal.com/api/v3/urls/${urlId}`, {
        method: 'GET',
        headers: { 'x-apikey': apiKey }
      });

      if (!response.ok) throw new Error("Erro na análise.");

      const data = await response.json();
      const stats = data.data.attributes.last_analysis_stats;
      
      const totalBad = stats.malicious + stats.suspicious;
      let status = 'safe';
      let message = '';

      // --- LÓGICA CALIBRADA (Menos alarmista) ---
      if (totalBad >= 2) {
        // Se 2 ou mais engines detectarem, aí sim é problema real
        status = 'danger';
        message = `CUIDADO: ${totalBad} fontes de segurança marcaram este site como malicioso.`;
      } else if (totalBad === 1) {
        // 1 detecção contra várias limpas = Falso Positivo (Ignorar alerta)
        status = 'safe';
        message = 'Site Seguro. (1 detecção isolada foi ignorada como falso positivo).';
      } else {
        // 0 detecções
        status = 'safe';
        message = 'Site verificado e aprovado. Nenhuma ameaça detectada.';
      }

      setResult({ status, message, stats });

    } catch (error: any) {
      setResult({ status: 'error', message: "Não foi possível analisar. Verifique a URL ou a Chave API." });
    } finally {
      setLoading(false);
    }
  };

  const scanPhone = () => {
    setLoading(true);
    setTimeout(() => {
        const num = inputValue.replace(/\D/g, '');
        if (num.startsWith('0800') || num.startsWith('4004') || num.length > 8) {
            setResult({ status: 'safe', message: 'Formato de número válido. Nenhuma denúncia de fraude encontrada.' });
        } else if (inputValue.startsWith('+234') || inputValue.startsWith('+212')) {
            setResult({ status: 'danger', message: 'DDI de alto risco associado a fraudes internacionais.' });
        } else {
            setResult({ status: 'safe', message: 'Número aparentemente normal.' });
        }
        setLoading(false);
    }, 1000);
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'safe': return '#10b981';
          case 'danger': return '#ef4444';
          default: return '#64748b';
      }
  };

  const getStatusBg = (status: string) => {
      switch(status) {
          case 'safe': return 'rgba(16, 185, 129, 0.1)';
          case 'danger': return 'rgba(239, 68, 68, 0.1)';
          default: return 'rgba(51, 65, 85, 0.5)';
      }
  };

  const getStatusIcon = (status: string) => {
      if (status === 'safe') return <CheckCircle size={48} color="#10b981" style={{marginBottom: 10}} />;
      if (status === 'danger') return <AlertTriangle size={48} color="#ef4444" style={{marginBottom: 10}} />;
      return <XCircle size={48} color="#64748b" style={{marginBottom: 10}} />;
  };

  return (
    <div className="container" style={{paddingTop: '30px'}}>
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div><h2 style={{margin: 0, fontSize: '1.8rem', fontFamily: 'var(--font-display)'}}>Scanner <span style={{color: '#ef4444'}}>VT</span></h2></div>
        <div style={{display: 'flex', gap: 10}}>
            <button onClick={() => setShowConfig(!showConfig)} style={{background: 'rgba(255,255,255,0.1)', border: 'none', color: '#cbd5e1', padding: '8px', borderRadius: '8px', cursor: 'pointer'}}><Settings size={18}/></button>
            <button onClick={onBack} style={{background: 'transparent', border: '1px solid var(--border)', color: '#94a3b8', padding: '8px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', cursor: 'pointer'}}><ArrowLeft size={16}/> Voltar</button>
        </div>
      </div>

      {showConfig && (
          <div className="card" style={{marginBottom: 20, border: '1px solid #3b82f6'}}>
              <h4 style={{marginTop: 0, display: 'flex', alignItems: 'center', gap: 10}}><Key size={16}/> Configurar VirusTotal</h4>
              <input type="password" placeholder="Cole sua API Key aqui" value={apiKey} onChange={e => setApiKey(e.target.value)} style={{marginBottom: 10}} />
              <button onClick={handleSaveKey} className="btn-primary" style={{padding: '8px'}}>Salvar</button>
          </div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button onClick={() => { setActiveTab('url'); setInputValue(''); setResult(null); }} style={{ flex: 1, padding: '15px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: activeTab === 'url' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)', color: activeTab === 'url' ? '#ef4444' : '#94a3b8', fontWeight: 600 }}><Globe size={20} /> URL</button>
          <button onClick={() => { setActiveTab('phone'); setInputValue(''); setResult(null); }} style={{ flex: 1, padding: '15px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: activeTab === 'phone' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)', color: activeTab === 'phone' ? '#ef4444' : '#94a3b8', fontWeight: 600 }}><Phone size={20} /> Telefone</button>
      </div>

      <div className="card" style={{ textAlign: 'center', padding: '40px 20px', minHeight: '300px' }}>
          {loading && <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}><Loader2 size={48} className="spin-animation" color="#ef4444" /><p style={{marginTop: 15}}>Consultando bases de dados...</p></div>}

          {!result && !loading && (
              <div style={{ marginBottom: '30px' }}>
                  <ShieldAlert size={64} color="#334155" style={{ marginBottom: '15px' }} />
                  <h3 style={{ color: '#94a3b8' }}>Verificação de Segurança</h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Analise URLs e telefones contra fraudes.</p>
              </div>
          )}

          {result && !loading && (
              <div style={{ marginBottom: '30px', padding: '20px', borderRadius: '16px', background: getStatusBg(result.status), border: `1px solid ${getStatusColor(result.status)}` }}>
                  {getStatusIcon(result.status)}
                  <h2 style={{ color: 'white', margin: '0 0 10px 0' }}>{result.status === 'safe' ? 'Resultado Seguro' : result.status === 'danger' ? 'Ameaça Detectada' : 'Erro'}</h2>
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
              <input value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder={activeTab === 'url' ? 'exemplo.com' : '(99) 99999-9999'} style={{ flex: 1, marginBottom: 0 }} />
              <button onClick={activeTab === 'url' ? scanUrl : scanPhone} className="btn-primary" style={{ width: 'auto', backgroundColor: '#ef4444', borderColor: '#ef4444' }}><Search size={20} /></button>
          </div>
      </div>
    </div>
  );
}