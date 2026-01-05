import CryptoJS from 'crypto-js';

// --- MODO PESADO (Para Senhas/Cofre) ---
const KEY_SIZE = 256 / 32;
const ITERATIONS = 10000; 

export const encryptData = (text: string, pin: string): string => {
  if (!text || !pin) return '';
  try {
    const salt = CryptoJS.lib.WordArray.random(128 / 8);
    const key = CryptoJS.PBKDF2(pin, salt, { keySize: KEY_SIZE, iterations: ITERATIONS });
    const iv = CryptoJS.lib.WordArray.random(128 / 8);
    const encrypted = CryptoJS.AES.encrypt(text, key, { iv: iv, padding: CryptoJS.pad.Pkcs7, mode: CryptoJS.mode.CBC });
    return salt.toString() + ':' + iv.toString() + ':' + encrypted.toString();
  } catch (e) { return ''; }
};

export const decryptData = (cipherText: string, pin: string): string | null => {
  if (!cipherText || !pin) return null;
  try {
    const parts = cipherText.split(':');
    if (parts.length !== 3) return null;
    const salt = CryptoJS.enc.Hex.parse(parts[0]);
    const iv = CryptoJS.enc.Hex.parse(parts[1]);
    const key = CryptoJS.PBKDF2(pin, salt, { keySize: KEY_SIZE, iterations: ITERATIONS });
    const decrypted = CryptoJS.AES.decrypt(parts[2], key, { iv: iv, padding: CryptoJS.pad.Pkcs7, mode: CryptoJS.mode.CBC });
    return decrypted.toString(CryptoJS.enc.Utf8) || null;
  } catch (error) { return null; }
};

// --- MODO LEVE (NOVO - Para Notas) ---
// Usa AES padrão, sem iterações pesadas. Muito mais rápido.
export const encryptLight = (text: string, pin: string): string => {
  if (!text || !pin) return '';
  // Criptografia AES Padrão (Rápida)
  return CryptoJS.AES.encrypt(text, pin).toString();
};

export const decryptLight = (cipherText: string, pin: string): string | null => {
  if (!cipherText || !pin) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, pin);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText || null;
  } catch (error) {
    return null;
  }
};