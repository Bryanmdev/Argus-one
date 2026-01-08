import { useState, useEffect } from 'react';
import { ArrowLeft, Globe, MapPin, Wifi, Eye, Laptop, ExternalLink, Loader2, Shield, Ghost, Layers, Eraser } from 'lucide-react';
import '../App.css';

interface PrivacyData {
  ip: string;
  city: string;
  region: string;
  country_name: string;
  org: string;
  latitude: number;
  longitude: number;
}

interface DeviceData {
  browser: string;
  os: string;
  screen: string;
  language: string;
  userAgent: string;
}

export default function PrivacyInspector({ onBack }: { onBack: () => void }) {
  const [loading, setLoading] = useState(true);
  const [networkData, setNetworkData] = useState<PrivacyData | null>(null);
  const [deviceData, setDeviceData] = useState<DeviceData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Tenta buscar dados. Se falhar (AdBlock ou Erro), cai no catch e networkData fica null.
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) throw new Error("Falha na API");
        
        const json = await response.json();
        
        // Validação extra: Se veio JSON mas sem IP, considera falha
        if (!json.ip) throw new Error("Dados vazios");

        setNetworkData({
            ip: json.ip,
            city: json.city,
            region: json.region,
            country_name: json.country_name,
            org: json.org,
            latitude: json.latitude,
            longitude: json.longitude
        });
      } catch (error) {
        console.error("Rastreamento bloqueado ou falha na API:", error);
        setNetworkData(null); // Garante que é null se falhar
      }

      // Dados do dispositivo sempre conseguimos pegar localmente
      const ua = navigator.userAgent;
      let os = "Desconhecido";
      if (ua.indexOf("Win") !== -1) os = "Windows";
      if (ua.indexOf("Mac") !== -1) os = "macOS";
      if (ua.indexOf("Linux") !== -1) os = "Linux";
      if (ua.indexOf("Android") !== -1) os = "Android";
      if (ua.indexOf("iPhone") !== -1) os = "iOS";

      let browser = "Desconhecido";
      if (ua.indexOf("Chrome") !== -1) browser = "Google Chrome";
      if (ua.indexOf("Firefox") !== -1) browser = "Mozilla Firefox";
      if (ua.indexOf("Safari") !== -1 && ua.indexOf("Chrome") === -1) browser = "Apple Safari";
      if (ua.indexOf("Edg") !== -1) browser = "Microsoft Edge";
      if (ua.indexOf("OPR") !== -1) browser = "Opera";

      setDeviceData({
          browser: browser,
          os: os,
          screen: `${window.screen.width}x${window.screen.height}`,
          language: navigator.language.toUpperCase(),
          userAgent: ua
      });

      setLoading(false);
    };

    // Pequeno delay para dar sensação de scan
    setTimeout(fetchData, 1500);
  }, []);

  return (
    <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto', paddingBottom: '40px' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', position: 'relative', zIndex: 50 }}>
        <div>
           <h2 style={{ margin: 0, fontSize: '1.8rem', fontFamily: 'var(--font-display)', color: 'var(--text-color)' }}>Privacy <span style={{ color: '#0ea5e9' }}>Inspector</span></h2>
           <p style={{ color: 'var(--text-secondary)' }}>Espelho Digital</p>
        </div>
        
        <button 
            onClick={onBack} 
            style={{ 
                width: 'auto', flexShrink: 0, background: 'transparent', 
                border: '1px solid var(--border)', color: 'var(--text-secondary)', 
                padding: '8px 16px', borderRadius: '8px', display: 'flex', 
                alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem'
            }}
        >
            <ArrowLeft size={16} /> Voltar
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Loader2 size={50} color="#0ea5e9" className="spin-animation" style={{ marginBottom: 20 }} />
            <h3 style={{ color: 'var(--text-color)' }}>Rastreando pegada digital...</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Analisando headers, IP e geolocalização.</p>
        </div>
      ) : (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            
            {/* CORREÇÃO DO CARD DE ALERTA: Lógica Condicional */}
            {networkData && networkData.ip ? (
                /* CASO 1: DADOS EXPOSTOS (IP Encontrado) */
                <div className="card" style={{ marginBottom: '30px', borderLeft: '4px solid #f59e0b', background: 'rgba(245, 158, 11, 0.05)' }}>
                    <div style={{ display: 'flex', gap: 15, alignItems: 'flex-start' }}>
                        <Eye size={24} color="#f59e0b" style={{ flexShrink: 0, marginTop: 4 }} />
                        <div>
                            <h3 style={{ margin: '0 0 5px 0', color: '#f59e0b' }}>Sua Visibilidade está ALTA</h3>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                Os dados abaixo (IP, Localização, Provedor) estão públicos para qualquer site que você visita.
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                /* CASO 2: DADOS PROTEGIDOS OU FALHA (IP Não Encontrado) */
                <div className="card" style={{ marginBottom: '30px', borderLeft: '4px solid #10b981', background: 'rgba(16, 185, 129, 0.05)' }}>
                    <div style={{ display: 'flex', gap: 15, alignItems: 'flex-start' }}>
                        <Shield size={24} color="#10b981" style={{ flexShrink: 0, marginTop: 4 }} />
                        <div>
                            <h3 style={{ margin: '0 0 5px 0', color: '#10b981' }}>Rastreamento Não Detectado</h3>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                Não conseguimos capturar seu IP ou localização. Isso indica que você pode estar usando um bloqueador eficiente ou a conexão de rastreamento falhou. <strong>Sua privacidade está preservada neste teste.</strong>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', marginBottom: '40px' }}>
                
                {/* 1. DADOS DE REDE */}
                <div className="card">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 15, marginTop: 0, color: 'var(--text-color)' }}>
                        <Globe size={20} color="#0ea5e9" /> Identidade de Rede
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 20 }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Endereço IP Público</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: networkData?.ip ? 'var(--text-color)' : '#64748b', fontFamily: 'monospace' }}>
                                {networkData?.ip || 'Oculto / Desconhecido'}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                             <div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <MapPin size={14} /> Localização
                                </div>
                                <div style={{ fontSize: '1.1rem', color: 'var(--text-color)' }}>
                                    {networkData?.city ? `${networkData.city}, ${networkData.region}` : 'Oculta'}
                                </div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    {networkData?.country_name || '-'}
                                </div>
                             </div>
                             <div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <Wifi size={14} /> Provedor (ISP)
                                </div>
                                <div style={{ fontSize: '1rem', color: 'var(--text-color)' }}>
                                    {networkData?.org || 'Oculto'}
                                </div>
                             </div>
                        </div>

                        {networkData?.latitude && (
                            <a 
                                href={`https://www.google.com/maps?q=${networkData.latitude},${networkData.longitude}`} 
                                target="_blank"
                                rel="noreferrer"
                                style={{ background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9', textDecoration: 'none', padding: '10px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: '0.9rem', fontWeight: 600, border: '1px solid rgba(14, 165, 233, 0.3)' }}
                            >
                                <ExternalLink size={16} /> Ver no Mapa
                            </a>
                        )}
                    </div>
                </div>

                {/* 2. DADOS DO DISPOSITIVO */}
                <div className="card">
                     <h3 style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 15, marginTop: 0, color: 'var(--text-color)' }}>
                        <Laptop size={20} color="#10b981" /> Dispositivo
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 15, marginTop: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Sistema</span>
                            <strong style={{ color: 'var(--text-color)' }}>{deviceData?.os}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Navegador</span>
                            <strong style={{ color: 'var(--text-color)' }}>{deviceData?.browser}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Resolução</span>
                            <strong style={{ color: 'var(--text-color)' }}>{deviceData?.screen}</strong>
                        </div>
                        <div style={{ background: 'var(--input-bg)', padding: '10px', borderRadius: '6px', marginTop: 10 }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: 5 }}>USER AGENT</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                {deviceData?.userAgent}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* DICAS DE PROTEÇÃO */}
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>
                Como reduzir sua exposição?
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                <div className="card" style={{ borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, color: '#10b981' }}>
                        <Shield size={22} />
                        <h4 style={{ margin: 0 }}>Use uma VPN</h4>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                        Uma VPN criptografa seus dados e mascara seu IP real (de {networkData?.city || 'sua cidade'}), protegendo sua localização física.
                    </p>
                </div>
                <div className="card" style={{ borderColor: 'rgba(59, 130, 246, 0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, color: '#3b82f6' }}>
                        <Ghost size={22} />
                        <h4 style={{ margin: 0 }}>Navegador Seguro</h4>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                        Navegadores como Brave ou Firefox dificultam a criação do seu perfil de usuário (fingerprinting).
                    </p>
                </div>
                <div className="card" style={{ borderColor: 'rgba(245, 158, 11, 0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, color: '#f59e0b' }}>
                        <Layers size={22} />
                        <h4 style={{ margin: 0 }}>Bloqueadores</h4>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                        Extensões como uBlock Origin impedem scripts de rastreamento que seguem você pela web.
                    </p>
                </div>
                <div className="card" style={{ borderColor: 'rgba(139, 92, 246, 0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, color: '#8b5cf6' }}>
                        <Eraser size={22} />
                        <h4 style={{ margin: 0 }}>Limpeza</h4>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                        Limpe cookies e cache regularmente para que sites esqueçam suas visitas passadas.
                    </p>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}