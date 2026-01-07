import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, Shield, Award, ChevronRight, RefreshCw, Loader2 } from 'lucide-react';
import '../App.css';

// --- TIPO ---
interface Question {
  id: number;
  type: string;
  sender: string;
  content: string;
  isScam: boolean;
  explanation: string;
}

// --- BIBLIOTECA DE 50 QUESTÕES ---
const FULL_QUESTION_POOL: Question[] = [
  // --- SMS & GOLPES BANCÁRIOS (1-10) ---
  { id: 1, type: 'SMS', sender: '28400', content: 'CAIXA: Compra aprovada de R$ 2.490,00. Caso nao reconheca, ligue IMEDIATAMENTE para 0800-999-1234.', isScam: true, explanation: 'GOLPE! Bancos nunca pedem para ligar para cancelar compras via SMS. O 0800 é falso.' },
  { id: 2, type: 'SMS', sender: 'Banco do Brasil', content: 'BB INFORMA: Sua senha de 6 digitos expirou. Acesse bb-seguranca-token.com para atualizar e evitar bloqueio.', isScam: true, explanation: 'GOLPE! O link não é oficial (bb.com.br). Bancos nunca mandam links para atualizar senha.' },
  { id: 3, type: 'SMS', sender: 'Nubank', content: 'Voce recebeu um PIX de R$ 450,00. Veja o comprovante no seu app.', isScam: false, explanation: 'SEGURO (Provavelmente). O SMS apenas avisa. O segredo é NÃO clicar em links, mas abrir o app oficial para conferir.' },
  { id: 4, type: 'SMS', sender: 'Correios', content: 'Sua encomenda foi taxada na alfandega. Pague a taxa de R$ 47,90 no link: correios-rastreio-taxa.com', isScam: true, explanation: 'GOLPE! Site falso. O oficial é correios.com.br. Golpistas usam taxas pequenas para pegar dados de cartão.' },
  { id: 5, type: 'SMS', sender: '29000', content: 'Protocolo 92831: Agendamento de troca de aparelho realizado com sucesso. Se nao foi voce, digite 1.', isScam: true, explanation: 'GOLPE! Ao responder ou ligar, eles tentarão roubar seus dados fingindo ser a central de segurança.' },
  { id: 6, type: 'SMS', sender: 'Detran-SP', content: 'Sua CNH esta em processo de suspensao. Regularize agora para evitar bloqueio: regulariza-cnh-gov.org', isScam: true, explanation: 'GOLPE! Sites do governo sempre terminam em .gov.br. Terminações .org ou .com para CNH são fraudes.' },
  { id: 7, type: 'SMS', sender: 'Bradesco', content: 'Chave Pix cadastrada com sucesso. Valor: R$ 1.200,00. Para contestar acesse: contestacao-pix-bradesco.com', isScam: true, explanation: 'GOLPE! Link falso. Nunca clique em links de contestação via SMS.' },
  { id: 8, type: 'SMS', sender: 'Serasa', content: 'Limpe seu nome hoje com 99% de desconto. Pague apenas R$ 50,00 e quite sua divida de R$ 5.000.', isScam: true, explanation: 'SUSPEITO/GOLPE. Descontos existem, mas ofertas milagrosas via SMS geralmente levam a boletos falsos. Consulte o app oficial do Serasa.' },
  { id: 9, type: 'SMS', sender: 'Operadora', content: 'Voce ganhou 10GB de internet bonus! Responda SIM para ativar.', isScam: false, explanation: 'GERALMENTE SEGURO. Operadoras usam SMS para promoções. Se não pedir senha ou cartão, costuma ser real.' },
  { id: 10, type: 'SMS', sender: 'Promoção', content: 'Parabens! Seu numero foi sorteado no Bolão da Sorte. Premio de R$ 50 mil. Ligue agora para retirar.', isScam: true, explanation: 'GOLPE ANTIGO. Ninguém ganha sorteio que não participou. Eles pedem depósito antecipado para "liberar" o prêmio.' },

  // --- WHATSAPP & ENGENHARIA SOCIAL (11-20) ---
  { id: 11, type: 'WhatsApp', sender: 'Filho (Foto Nova)', content: 'Oi pai, troquei de número. Salva esse novo e apaga o velho. Tô precisando de uma ajuda urgente pra pagar um boleto.', isScam: true, explanation: 'GOLPE DO NOVO NÚMERO. Ligue para o número ANTIGO do seu filho para confirmar a voz. Nunca faça Pix sem confirmar.' },
  { id: 12, type: 'WhatsApp', sender: 'Gerente do Banco', content: 'Olá, aqui é o Roberto da sua agência. Detectamos uma invasão na sua conta. Preciso que você me passe o código que chegou por SMS.', isScam: true, explanation: 'GOLPE! Gerentes NUNCA pedem códigos de SMS/Token por WhatsApp. Eles querem roubar seu acesso.' },
  { id: 13, type: 'WhatsApp', sender: 'Rh Amazon', content: 'Vaga de emprego meio período. Ganhe R$ 500 a R$ 3000 por dia trabalhando de casa. Clique para se inscrever.', isScam: true, explanation: 'GOLPE DO EMPREGO. Promessas de dinheiro fácil são usadas para roubar dados ou fazer você trabalhar de graça em esquemas de pirâmide.' },
  { id: 14, type: 'WhatsApp', sender: 'Suporte Técnico', content: 'O suporte do WhatsApp informa: sua conta será bloqueada se não confirmar seus dados. Digite o código de 6 dígitos.', isScam: true, explanation: 'GOLPE DA CLONAGEM. O WhatsApp nunca entra em contato por chat pedindo códigos. Eles querem clonar seu zap.' },
  { id: 15, type: 'WhatsApp', sender: 'Amigo', content: 'Oi! Vi que você tá vendendo umas coisas na OLX. Pode me mandar o código que chegou no seu celular pra eu confirmar a compra?', isScam: true, explanation: 'GOLPE. O código é para ativar o WhatsApp dele no seu número. Nunca compartilhe códigos de SMS.' },
  { id: 16, type: 'WhatsApp', sender: 'Desconhecido', content: 'Pix errado! Moça, te mandei R$ 500 sem querer. Pode me devolver para essa outra chave aqui?', isScam: true, explanation: 'GOLPE DO PIX. Eles mandam um comprovante falso ou usam dinheiro roubado. Se recebeu mesmo, devolva usando o botão "Devolver" do banco, nunca para outra chave.' },
  { id: 17, type: 'WhatsApp', sender: 'Grupo da Família', content: 'Link para o churrasco de domingo: maps.google.com/localizacao', isScam: false, explanation: 'SEGURO. Links do Google Maps enviados por conhecidos em contexto real são seguros.' },
  { id: 18, type: 'WhatsApp', sender: 'Loja Famosa', content: 'Queima de estoque Magalu! iPhones por R$ 800,00. Só hoje!', isScam: true, explanation: 'GOLPE. Preços irreais indicam sites falsos clonados.' },
  { id: 19, type: 'WhatsApp', sender: 'Investimento', content: 'Dobre seu dinheiro em 24h com a nossa mesa de criptomoedas. Retorno garantido.', isScam: true, explanation: 'GOLPE. Retorno garantido em renda variável não existe.' },
  { id: 20, type: 'WhatsApp', sender: 'Pesquisa', content: 'Responda essa pesquisa sobre a Covid e ganhe um brinde. Qual seu CPF?', isScam: true, explanation: 'ROUBO DE DADOS. Pesquisas sérias não pedem CPF ou dados sensíveis pelo WhatsApp.' },

  // --- E-MAIL & PHISHING (21-30) ---
  { id: 21, type: 'E-mail', sender: 'noreply@netflix-suporte.com', content: 'Sua assinatura foi suspensa. Atualize seu pagamento agora para não perder o acesso.', isScam: true, explanation: 'GOLPE. Olhe o remetente "netflix-suporte.com". O oficial é apenas "netflix.com".' },
  { id: 22, type: 'E-mail', sender: 'seguranca@itau.com.br', content: 'Novo dispositivo conectado: iPhone 14 em Curitiba. Se não foi você, clique aqui.', isScam: false, explanation: 'PROVAVELMENTE SEGURO. O remetente parece legítimo. Mas a regra de ouro é: não clique. Abra o app do banco para verificar.' },
  { id: 23, type: 'E-mail', sender: 'intimacao@tj-sp.jus.br', content: 'Você tem uma intimação judicial pendente. Baixe o anexo PDF para ler o processo.', isScam: false, explanation: 'ALERTA: Tribunais usam e-mail, mas anexos são perigosos. Verifique o remetente oficial (.jus.br). Na dúvida, consulte um advogado antes de baixar.' },
  { id: 24, type: 'E-mail', sender: 'ofertas@americanas-saldao.net', content: 'TV Smart 50 polegadas por R$ 999,00. Últimas unidades.', isScam: true, explanation: 'GOLPE. O domínio "americanas-saldao.net" é falso. Grandes lojas usam apenas o domínio principal.' },
  { id: 25, type: 'E-mail', sender: 'appleid@icloud-verify.com', content: 'Seu iPhone foi localizado. Clique para ver a localização.', isScam: true, explanation: 'GOLPE. Comum quando se perde o celular. Ladrões mandam site falso da Apple para roubar sua senha e desbloquear o aparelho roubado.' },
  { id: 26, type: 'E-mail', sender: 'gerente@suaempresa.com', content: 'Oi, estou em reunião. Preciso que você compre 5 gift cards da Apple e me mande os códigos agora. É urgente.', isScam: true, explanation: 'GOLPE DO CEO. Criminosos falsificam o e-mail do chefe pedindo compras urgentes e gift cards.' },
  { id: 27, type: 'E-mail', sender: 'suporte@instagram.com', content: 'Sua conta recebeu o selo de verificação azul! Clique para ativar.', isScam: true, explanation: 'GOLPE. O Instagram não oferece verificação ativa por e-mail aleatoriamente.' },
  { id: 28, type: 'E-mail', sender: 'receita@federal.gov.br', content: 'Você caiu na malha fina. Baixe o relatório de pendências.', isScam: false, explanation: 'CUIDADO: A Receita Federal NÃO manda e-mail com links ou anexos para baixar. Você deve entrar no portal e-CAC por conta própria.' },
  { id: 29, type: 'E-mail', sender: 'fatura@vivo.com.br', content: 'Sua fatura digital chegou.', isScam: false, explanation: 'SEGURO. Se você pediu fatura digital, é normal. Verifique se o código de barras funciona no app do banco.' },
  { id: 30, type: 'E-mail', sender: 'admin@google-security.tk', content: 'Alerta de segurança crítico. Mude sua senha imediatamente.', isScam: true, explanation: 'GOLPE. Domínios estranhos como .tk, .xyz, .top geralmente são usados em fraudes.' },

  // --- NAVEGAÇÃO & SITES (31-40) ---
  { id: 31, type: 'Site', sender: 'Pop-up no Navegador', content: 'SEU PC ESTÁ INFECTADO COM 3 VÍRUS! Clique aqui para limpar agora antes que perca seus dados.', isScam: true, explanation: 'SCAREWARE. Sites não podem escanear seu PC. É um anúncio falso para te fazer baixar um vírus real ou pagar por um antivírus falso.' },
  { id: 32, type: 'Site', sender: 'leilao-receita.org', content: 'Leilão Receita Federal. Carros e iPhones baratos.', isScam: true, explanation: 'GOLPE. Leilões oficiais ocorrem dentro do site gov.br ou portais de leiloeiros oficiais, nunca em sites ".org" genéricos.' },
  { id: 33, type: 'Site', sender: 'Google Search', content: 'Primeiro resultado para "Suporte Facebook": 0800-123-4567', isScam: true, explanation: 'GOLPE. Golpistas pagam anúncios no Google para aparecerem antes do suporte oficial. Facebook/Google não têm 0800 fácil assim.' },
  { id: 34, type: 'Site', sender: 'Download', content: 'Para baixar o filme, clique no botão verde "Download" piscando.', isScam: true, explanation: 'ADWARE. Em sites de download, botões grandes e coloridos geralmente são propagandas. O link real costuma ser pequeno e discreto.' },
  { id: 35, type: 'Site', sender: 'E-commerce', content: 'Mercado Livre: Pagamento recusado. Atualize seu cartão.', isScam: true, explanation: 'VERIFIQUE A URL. Se a URL não for mercadolivre.com.br, é um clone para roubar cartão.' },
  { id: 36, type: 'Site', sender: 'Anúncio YouTube', content: 'Elon Musk lança nova moeda. Invista R$ 100 e tire R$ 1000.', isScam: true, explanation: 'DEEPFAKE. Vídeos falsos criados com IA usando a imagem de famosos para golpes financeiros.' },
  { id: 37, type: 'Site', sender: 'Governo', content: 'Valores a Receber: Consulte se você tem dinheiro esquecido nos bancos.', isScam: false, explanation: 'REAL, MAS CUIDADO. Existe o sistema oficial (valoresareceber.bcb.gov.br). Qualquer outro site pedindo taxa para liberar o dinheiro é GOLPE.' },
  { id: 38, type: 'Site', sender: 'Facebook Login', content: 'Para ver essa foto, faça login novamente no Facebook.', isScam: true, explanation: 'PHISHING. Se abriu uma nova janela com endereço estranho pedindo login, não digite.' },
  { id: 39, type: 'Site', sender: 'Loja Instagram', content: 'Loja sem CNPJ, apenas com fotos de produtos e pagamento só via Pix.', isScam: true, explanation: 'RISCO ALTO. Lojas sem identificação, sem Reclame Aqui e que não aceitam cartão de crédito costumam ser golpe.' },
  { id: 40, type: 'Site', sender: 'Quiz', content: 'Descubra com qual celebridade você parece! Apenas libere acesso à sua câmera e contatos.', isScam: true, explanation: 'PRIVACIDADE. Esses testes servem para coletar seus dados e fotos para treinar IAs ou vender informações.' },

  // --- SITUAÇÕES DO DIA A DIA (41-50) ---
  { id: 41, type: 'Ligação', sender: '0303-000-0000', content: 'Alô, aqui é da central de segurança do Banco. Tentaram fazer uma compra de 3 mil. Foi o senhor?', isScam: true, explanation: 'VISHING. O banco liga, mas nunca pede senha ou pede para instalar app. Se ficar na dúvida, desligue e ligue você para o número atrás do cartão.' },
  { id: 42, type: 'Pessoalmente', sender: 'Maquininha', content: 'O visor da maquininha está quebrado, mas o valor é R$ 10,00. Pode aproximar o cartão.', isScam: true, explanation: 'GOLPE DA MAQUININHA. Nunca passe o cartão se não conseguir ver o valor no visor. Eles podem digitar R$ 1.000,00.' },
  { id: 43, type: 'Ligação', sender: 'Número Desconhecido', content: 'Toque único (chamada cai imediatamente).', isScam: true, explanation: 'SPAM/GOLPE. Se você retornar a ligação, pode ser cobrado tarifas altíssimas ou cair em golpe.' },
  { id: 44, type: 'App', sender: 'App Store', content: 'App "Lanterna Grátis" pede permissão para acessar sua Localização e Contatos.', isScam: true, explanation: 'ABUSIVO. Uma lanterna não precisa saber onde você mora. Negue permissões desnecessárias.' },
  { id: 45, type: 'Rua', sender: 'Pesquisa', content: 'Pessoas oferecendo brinde grátis se você tirar uma foto do seu rosto para "confirmação".', isScam: true, explanation: 'GOLPE DA BIOMETRIA. Eles usam sua foto para abrir contas digitais ou fazer empréstimos em seu nome.' },
  { id: 46, type: 'Boleto', sender: 'Correio', content: 'Boleto de Renovação de Domínio/Marca. Parece oficial.', isScam: true, explanation: 'BOLETO FACULTATIVO. Empresas mandam boletos com aparência oficial que na verdade são ofertas de serviços opcionais inúteis (DDA).' },
  { id: 47, type: 'Ligação', sender: 'INSS', content: 'Precisamos fazer a prova de vida online. Mande foto do documento.', isScam: true, explanation: 'CUIDADO. O INSS tem regras específicas. Não mande dados por WhatsApp para desconhecidos.' },
  { id: 48, type: 'Wi-Fi', sender: 'Aeroporto', content: 'Wi-Fi Grátis "Aeroporto_Free_Ultra". Conecte sem senha.', isScam: true, explanation: 'HONEYPOT. Redes abertas podem ser criadas por hackers para interceptar seus dados. Use VPN ou 4G/5G.' },
  { id: 49, type: 'QR Code', sender: 'Poste na Rua', content: 'Ganhe R$ 50 escaneando este código.', isScam: true, explanation: 'QRLJACKING. QR Codes na rua podem levar a sites maliciosos ou baixar vírus no celular.' },
  { id: 50, type: 'Pix', sender: 'Erro', content: 'Agendei um Pix errado para você. Pode me devolver?', isScam: true, explanation: 'GOLPE DO AGENDAMENTO. O golpista agenda, manda o print, você "devolve" o dinheiro real, e ele cancela o agendamento depois.' }
];

// --- COMPONENTE PRINCIPAL ---
export default function EduQuiz({ onBack }: { onBack: () => void }) {
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answerState, setAnswerState] = useState<'idle' | 'correct' | 'wrong'>('idle'); 
  const [loading, setLoading] = useState(true);

  // INICIALIZAÇÃO: EMBARALHAR E PEGAR 10
  useEffect(() => {
    startNewSession();
  }, []);

  const startNewSession = () => {
    setLoading(true);
    // Algoritmo simples de embaralhamento (Shuffle)
    const shuffled = [...FULL_QUESTION_POOL].sort(() => 0.5 - Math.random());
    // Pega os 10 primeiros
    const selected = shuffled.slice(0, 10);
    
    setSessionQuestions(selected);
    setCurrentQIndex(0);
    setScore(0);
    setShowResult(false);
    setAnswerState('idle');
    
    // Pequeno delay para sensação de carregamento
    setTimeout(() => setLoading(false), 500);
  };

  const handleAnswer = (userSaidScam: boolean) => {
    const currentQ = sessionQuestions[currentQIndex];
    const isCorrect = userSaidScam === currentQ.isScam;
    
    if (isCorrect) {
        setScore(score + 1);
        setAnswerState('correct');
    } else {
        setAnswerState('wrong');
    }
  };

  const nextQuestion = () => {
      setAnswerState('idle');
      if (currentQIndex + 1 < sessionQuestions.length) {
          setCurrentQIndex(currentQIndex + 1);
      } else {
          setShowResult(true);
      }
  };

  // --- LOADING STATE ---
  if (loading) {
      return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
              <Loader2 className="spin-animation" size={48} color="#f59e0b" />
              <p style={{ marginTop: 20, color: '#94a3b8' }}>Gerando cenários de segurança...</p>
          </div>
      );
  }

  // --- RESULTADO FINAL ---
  if (showResult) {
      return (
          <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '40px 20px', animation: 'fadeIn 0.5s' }}>
              <div className="card" style={{ padding: '40px 20px', borderColor: score >= 7 ? '#10b981' : '#ef4444' }}>
                  <Award size={64} color={score >= 7 ? '#f59e0b' : '#94a3b8'} style={{ marginBottom: 20 }} />
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', margin: '0 0 10px 0', color: 'white' }}>
                      {score === 10 ? 'Mestre da Segurança!' : score >= 7 ? 'Aprovado!' : 'Precisa Melhorar'}
                  </h2>
                  <p style={{ fontSize: '1.2rem', color: '#cbd5e1', marginBottom: 30 }}>
                      Você acertou <strong>{score}</strong> de <strong>10</strong> cenários aleatórios.
                  </p>
                  
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                      <button 
                        onClick={onBack} 
                        style={{ background: 'transparent', border: '1px solid var(--border)', color: '#94a3b8', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer' }}
                      >
                          Voltar ao Menu
                      </button>
                      <button onClick={startNewSession} className="btn-primary" style={{ width: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
                          <RefreshCw size={18} /> Novos Cenários
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  const currentData = sessionQuestions[currentQIndex];

  // --- TELA DO QUIZ ---
  return (
    <div style={{ width: '100%', maxWidth: '700px', margin: '0 auto', paddingBottom: '40px' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
           <h2 style={{ margin: 0, fontSize: '1.5rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: 10, color: 'white' }}>
               <Shield size={28} color="#f59e0b" /> Academia Anti-Golpe
           </h2>
           <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>Cenário {currentQIndex + 1} de 10</p>
        </div>
        
        {/* BOTÃO DE VOLTAR CORRIGIDO (Pequeno e Ajustado) */}
        <button 
            onClick={onBack} 
            style={{ 
                width: 'auto', 
                flex: 'none',
                background: 'transparent', 
                border: '1px solid var(--border)', 
                color: '#94a3b8', 
                padding: '8px 12px', 
                borderRadius: '8px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                cursor: 'pointer',
                fontSize: '0.9rem'
            }}
        >
            <ArrowLeft size={16} /> Sair
        </button>
      </div>

      {/* PROGRESSO */}
      <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', marginBottom: '30px', overflow: 'hidden' }}>
          <div style={{ width: `${((currentQIndex) / 10) * 100}%`, height: '100%', background: '#f59e0b', transition: 'width 0.3s ease' }}></div>
      </div>

      {/* ÁREA DO CENÁRIO */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', border: 'none', background: 'transparent', marginBottom: '20px', animation: 'fadeIn 0.3s' }}>
          <div style={{ background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border)', padding: '25px', position: 'relative' }}>
               <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 15, display: 'flex', justifyContent: 'space-between' }}>
                   <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><AlertTriangle size={14}/> {currentData.type}</span>
                   <span>De: {currentData.sender}</span>
               </div>
               
               <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #3b82f6', color: 'var(--text-color)', fontSize: '1.1rem', lineHeight: '1.6', fontStyle: 'italic' }}>
                   "{currentData.content}"
               </div>
          </div>
      </div>

      {/* ÁREA DE DECISÃO */}
      {answerState === 'idle' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <button 
                onClick={() => handleAnswer(false)}
                style={{ background: 'rgba(16, 185, 129, 0.1)', border: '2px solid #10b981', color: '#10b981', padding: '20px', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, transition: 'transform 0.1s', fontFamily: 'var(--font-display)' }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                  <CheckCircle size={32} />
                  É Seguro / Verdadeiro
              </button>

              <button 
                onClick={() => handleAnswer(true)}
                style={{ background: 'rgba(239, 68, 68, 0.1)', border: '2px solid #ef4444', color: '#ef4444', padding: '20px', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, transition: 'transform 0.1s', fontFamily: 'var(--font-display)' }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                  <AlertTriangle size={32} />
                  É Golpe / Fraude
              </button>
          </div>
      ) : (
          /* FEEDBACK APÓS RESPONDER */
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={{ 
                  background: answerState === 'correct' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                  border: `1px solid ${answerState === 'correct' ? '#10b981' : '#ef4444'}`,
                  borderRadius: '12px', padding: '25px', textAlign: 'center', marginBottom: '20px'
              }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 15 }}>
                      {answerState === 'correct' ? <CheckCircle size={40} color="#10b981" /> : <XCircle size={40} color="#ef4444" />}
                  </div>
                  <h3 style={{ margin: '0 0 10px 0', color: answerState === 'correct' ? '#10b981' : '#ef4444', fontSize: '1.3rem' }}>
                      {answerState === 'correct' ? 'Você Acertou!' : 'Cuidado!'}
                  </h3>
                  <p style={{ color: 'var(--text-color)', lineHeight: '1.5', fontSize: '1rem' }}>
                      {currentData.explanation}
                  </p>
              </div>
              
              <button onClick={nextQuestion} className="btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, height: '50px' }}>
                  Próximo Cenário <ChevronRight size={20} />
              </button>
          </div>
      )}

    </div>
  );
}