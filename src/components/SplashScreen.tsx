import '../App.css';

interface SplashScreenProps { onFinish: () => void; }

const SplashScreen = ({ onFinish }: SplashScreenProps) => {
  return (
    <div 
      style={{
        position: 'fixed', // ESSENCIAL: Garante que cubra a tela ignorando scroll
        top: 0,
        left: 0,
        width: '100vw',    // Largura total da viewport
        height: '100vh',   // Altura total da viewport
        backgroundColor: '#020617', // Preto absoluto
        backgroundImage: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)',
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,      // Fica na frente de tudo
        margin: 0,
        padding: 0,
        overflow: 'hidden'
      }}
    >
      <svg 
        viewBox="0 0 200 200" 
        xmlns="http://www.w3.org/2000/svg"
        style={{
            width: '160px',
            height: '160px',
            filter: 'drop-shadow(0 0 10px rgba(139, 92, 246, 0.4))',
            marginBottom: '24px',
            display: 'block'
        }}
      >
        <path 
            d="M20,100 C20,100 60,40 100,40 C140,40 180,100 180,100 C180,100 140,160 100,160 C60,160 20,100 20,100 Z M100,40 L100,20 M100,180 L100,160 M20,100 L10,100 M190,100 L180,100 M50,65 L40,55 M160,55 L150,65 M50,135 L40,145 M160,145 L150,135" 
            fill="none" 
            stroke="#8b5cf6" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeDasharray="1000" 
            strokeDashoffset="1000"
            style={{ animation: 'drawLines 2.5s cubic-bezier(0.4, 0, 0.2, 1) forwards' }}
        />
        <path 
            d="M100,130 C116.568542,130 130,116.568542 130,100 C130,83.4314575 116.568542,70 100,70 C83.4314575,70 70,83.4314575 70,100 C70,116.568542 83.4314575,130 100,130 Z M100,110 C105.522847,110 110,105.522847 110,100 C110,94.4771525 105.522847,90 100,90 C94.4771525,90 90,94.4771525 90,100 C90,105.522847 94.4771525,110 100,110 Z M100,100 L130,100 M100,100 L70,100 M100,100 L100,70 M100,100 L100,130" 
            className="splash-path-iris"
            fill="none"
            stroke="white" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeDasharray="1000" 
            strokeDashoffset="1000"
            style={{ animation: 'drawLines 2.5s cubic-bezier(0.4, 0, 0.2, 1) forwards', animationDelay: '0.5s' }}
        />
      </svg>

      <div 
        style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '3rem',
            fontWeight: 800,
            letterSpacing: '-1px',
            textTransform: 'uppercase',
            marginTop: '0.5rem',
            textAlign: 'center',
            opacity: 0,
            animation: 'fadeInUp 0.8s ease-out 1.8s forwards'
        }}
      >
        <span style={{ color: '#8b5cf6' }}>ARGUS</span>
        <span style={{ color: 'white' }}>ONE</span>
      </div>

      <p 
        style={{
            fontFamily: "'Outfit', sans-serif",
            marginTop: '0.8rem',
            color: '#64748b',
            fontSize: '0.9rem',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            opacity: 0,
            animation: 'fadeInUp 0.8s ease-out 2.0s forwards'
        }}
      >
        Inicializando Protocolos...
      </p>

      <button 
        onClick={onFinish}
        className="btn-enter-system" 
        style={{
            marginTop: '3rem',
            background: 'transparent',
            border: '1px solid rgba(139, 92, 246, 0.5)',
            color: 'white',
            
            /* --- TAMANHO DO BOTÃO ORIGINAL (CORRIGIDO) --- */
            width: 'auto',
            minWidth: '0',        /* Remove restrição */
            padding: '12px 36px', /* Padding balanceado */
            fontSize: '1rem',
            /* ------------------------------------------- */

            textAlign: 'center',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontFamily: "'Outfit', sans-serif",
            letterSpacing: '3px',
            fontWeight: 600,
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            borderRadius: '50px',
            opacity: 0,
            animation: 'fadeInUp 0.8s ease-out 2.5s forwards'
        }}
      >
        ACESSAR SISTEMA
      </button>

      <style>{`
        @keyframes drawLines { 
            0% { stroke-dashoffset: 1000; } 
            100% { stroke-dashoffset: 0; } 
        }
        @keyframes fadeInUp { 
            0% { opacity: 0; transform: translateY(20px); } 
            100% { opacity: 1; transform: translateY(0); } 
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;