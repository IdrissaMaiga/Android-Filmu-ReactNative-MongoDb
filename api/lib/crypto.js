import CryptoJS from 'crypto-js';
import dotenv from 'dotenv';

dotenv.config(); // Ensure environment variables are loaded

const secretKey = process.env.SECRET_KEY;

if (!secretKey) {
  throw new Error('SECRET_KEY is not defined in the .env file');
}

// Encrypt function
export const encrypt = (text) => {
  if (!text) {
    throw new Error('No text provided for encryption');
  }
  const encrypted = CryptoJS.AES.encrypt(text, secretKey).toString();
  return encrypted;
}

// Decrypt function
export const decrypt = (cipherText) => {
  if (!cipherText) {
    throw new Error('No cipherText provided for decryption');
  }
 // console.log('Secret Key:', secretKey);
  const bytes = CryptoJS.AES.decrypt(cipherText, secretKey);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  return decrypted;
}
