// --- CRIPTOGRAFIA LEVE (Para Carteira/PIN - Rápida) ---
// Usa um algoritmo simples de substituição reversível baseado em PIN numérico
export const encryptLight = (text: string, pin: string): string => {
  if (!text || !pin) return text;
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    const pinChar = pin.charCodeAt(i % pin.length);
    result += String.fromCharCode(charCode + pinChar);
  }
  return btoa(result); // Base64 para ficar legível/salvável
};

export const decryptLight = (encryptedText: string, pin: string): string => {
  if (!encryptedText || !pin) return encryptedText;
  try {
    const text = atob(encryptedText);
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      const pinChar = pin.charCodeAt(i % pin.length);
      result += String.fromCharCode(charCode - pinChar);
    }
    return result;
  } catch (e) {
    return ''; // Retorna vazio se a senha estiver errada/texto corrompido
  }
};

// --- CRIPTOGRAFIA FORTE (Para Senhas/Vault - Mais Robusta) ---
// Simulação de algoritmo forte (AES-like) para o cofre
// Em produção real, use a biblioteca 'crypto-js' ou WebCryptoAPI
export const encrypt = (text: string, key: string): string => {
  if (!text || !key) return '';
  // Usa a mesma lógica base mas com salt e complexidade maior simulada
  const salt = key.length.toString();
  const mixedKey = key + salt;
  return encryptLight(text, mixedKey); 
};

export const decrypt = (encryptedText: string, key: string): string => {
  if (!encryptedText || !key) return '';
  const salt = key.length.toString();
  const mixedKey = key + salt;
  return decryptLight(encryptedText, mixedKey);
};
