// --- UTILS DE CRIPTOGRAFIA (XOR Cipher + Base64) ---

// Função auxiliar para evitar problemas com caracteres especiais/acentos no btoa
const toBase64 = (str: string) => {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode(parseInt(p1, 16));
    }));
}

const fromBase64 = (str: string) => {
    return decodeURIComponent(atob(str).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

// Criptografa e adiciona uma assinatura para validar a senha depois
export const encrypt = (text: string, key: string): string => {
  if (!text || !key) return '';
  
  // Adiciona um prefixo conhecido "VALID:" para podermos checar se a senha está certa na volta
  const payload = `VALID:${text}`;
  
  let result = '';
  for (let i = 0; i < payload.length; i++) {
    const charCode = payload.charCodeAt(i);
    const keyChar = key.charCodeAt(i % key.length);
    // XOR é melhor que soma pois é perfeitamente reversível e mantém o range
    result += String.fromCharCode(charCode ^ keyChar);
  }
  
  return toBase64(result);
};

export const decrypt = (encryptedText: string, key: string): string | null => {
  if (!encryptedText || !key) return null;
  
  try {
    const text = fromBase64(encryptedText);
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      const keyChar = key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode ^ keyChar);
    }

    // VERIFICAÇÃO DE INTEGRIDADE
    // Se a senha estiver certa, o texto DEVE começar com "VALID:"
    if (result.startsWith('VALID:')) {
        return result.substring(6); // Retorna o texto original sem o prefixo
    }
    return null; // Senha errada (decriptou lixo)

  } catch (e) {
    return null; // Erro de formato
  }
};

// Aliases para compatibilidade com outros arquivos que usam encryptLight
export const encryptLight = encrypt;
export const decryptLight = (text: string, key: string) => decrypt(text, key) || '';
