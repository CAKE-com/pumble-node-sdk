import { ENCRYPTION_KEY, ENCRYPTION_IV } from '../config';
const crypto = require('crypto');
const algorithm = 'aes256';
const key = ENCRYPTION_KEY;
const iv = ENCRYPTION_IV;

export function encrypt(text: string) {
    let cipher = crypto.createCipheriv(algorithm, key, iv);
    return cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
}

export function decrypt(encryptedText: string) {
    let decipher = crypto.createDecipheriv(algorithm, key, iv);
    return decipher.update(encryptedText, 'hex', 'utf8') + decipher.final('utf8');
}