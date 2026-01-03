import CryptoJS from 'crypto-js';

// Função para CRIPTOGRAFAR
export const encryptData = (text: string, secretKey: string) => {
  if (!text || !secretKey) return '';
  return CryptoJS.AES.encrypt(text, secretKey).toString();
};

// Função para DESCRIPTOGRAFAR
export const decryptData = (ciphertext: string, secretKey: string) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!originalText) return null;
    
    return originalText;
  } catch (error) {
    return null; 
  }
};