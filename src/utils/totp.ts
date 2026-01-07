import CryptoJS from 'crypto-js';

// Função auxiliar para decodificar Base32 (Padrão dos Secrets de 2FA)
const base32tohex = (base32: string) => {
    const base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let bits = "";
    let hex = "";

    // Limpa espaços e força maiúsculas
    const cleanBase32 = base32.replace(/\s/g, '').toUpperCase();

    for (let i = 0; i < cleanBase32.length; i++) {
        const val = base32chars.indexOf(cleanBase32.charAt(i));
        if (val === -1) throw new Error("Caractere Base32 inválido");
        bits += val.toString(2).padStart(5, '0');
    }

    for (let i = 0; i + 4 <= bits.length; i += 4) {
        const chunk = bits.substr(i, 4);
        hex = hex + parseInt(chunk, 2).toString(16);
    }
    return hex;
};

// Gera o código de 6 dígitos baseado no tempo atual
export const generateTOTP = (secret: string) => {
    try {
        const epoch = Math.round(new Date().getTime() / 1000.0);
        const time = Math.floor(epoch / 30).toString(16).padStart(16, '0'); // Contador de 30s

        // Converte secret Base32 para Hex
        const secretHex = base32tohex(secret);

        // Calcula HMAC-SHA1
        const hmac = CryptoJS.HmacSHA1(CryptoJS.enc.Hex.parse(time), CryptoJS.enc.Hex.parse(secretHex));
        const hmacHex = hmac.toString(CryptoJS.enc.Hex);

        // Dynamic Truncation (Algoritmo RFC 4226)
        const offset = parseInt(hmacHex.substring(hmacHex.length - 1), 16);
        const otp = (parseInt(hmacHex.substr(offset * 2, 8), 16) & 0x7fffffff) + "";
        
        // Pega os últimos 6 dígitos
        return otp.substr(otp.length - 6, 6);
    } catch (e) {
        console.error("Erro ao gerar TOTP:", e);
        return "ERROR";
    }
};

// Calcula quantos segundos faltam para o código expirar (para a animação)
export const getRemainingSeconds = () => {
    const epoch = Math.round(new Date().getTime() / 1000.0);
    return 30 - (epoch % 30);
};