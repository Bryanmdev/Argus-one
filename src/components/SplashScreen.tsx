import React from 'react';
import { ArrowRight } from 'lucide-react';
import '../App.css';

// Recebemos a função "onFinish" para avisar o Dashboard que pode entrar
interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen = ({ onFinish }: SplashScreenProps) => {
  return (
    <div className="splash-screen-container">
      {/* SVG DO OLHO CIBERNÉTICO */}
      <svg className="splash-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <path 
          className="splash-path" 
          d="M20,100 C20,100 60,40 100,40 C140,40 180,100 180,100 C180,100 140,160 100,160 C60,160 20,100 20,100 Z M100,40 L100,20 M100,180 L100,160 M20,100 L10,100 M190,100 L180,100 M50,65 L40,55 M160,55 L150,65 M50,135 L40,145 M160,145 L150,135"
        />
        <path 
          className="splash-path splash-path-iris" 
          d="M100,130 C116.568542,130 130,116.568542 130,100 C130,83.4314575 116.568542,70 100,70 C83.4314575,70 70,83.4314575 70,100 C70,116.568542 83.4314575,130 100,130 Z M100,110 C105.522847,110 110,105.522847 110,100 C110,94.4771525 105.522847,90 100,90 C94.4771525,90 90,94.4771525 90,100 C90,105.522847 94.4771525,110 100,110 Z M100,100 L130,100 M100,100 L70,100 M100,100 L100,70 M100,100 L100,130"
        />
      </svg>
      
      {/* TÍTULO COM DUAS CORES E FONTE NOVA */}
      <div className="splash-title-wrapper">
        <span className="text-argus">ARGUS</span> <span className="text-one">ONE</span>
      </div>
      
      <p className="splash-subtitle">PROTOCOLO DE SEGURANÇA ATIVO</p>

      {/* BOTÃO PARA ENTRAR (Só aparece no final da animação) */}
      <button onClick={onFinish} className="btn-enter-system">
        Acessar Sistema
      </button>
    </div>
  );
};

export default SplashScreen;