import mongoose from 'mongoose';
import crypto from 'crypto';

// 使用固定32字节的密钥进行 AES-256-CBC 加密
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012'; 
const IV_LENGTH = 16; 

function encrypt(text) {
    if (!text) return text;
    try {
        let iv = crypto.randomBytes(IV_LENGTH);
        let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    } catch(err) {
        return text;
    }
}

function decrypt(text) {
    if (!text) return text;
    // 防止尚未加密的旧纯文本数据解密报错
    if (!text.includes(':')) return text; 
    try {
        let textParts = text.split(':');
        let iv = Buffer.from(textParts.shift(), 'hex');
        let encryptedText = Buffer.from(textParts.join(':'), 'hex');
        let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch(err) {
        return text;
    }
}

const settingsSchema = new mongoose.Schema({
    baseURL: {
        type: String,
        set: encrypt,
        get: decrypt,
        default: ''
    },
    apiKey: {
        type: String,
        set: encrypt,
        get: decrypt,
        default: ''
    },
    modelId: {
        type: String,
        set: encrypt,
        get: decrypt,
        default: 'gemini-3.1-flash-image-preview'
    }
}, {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
});

export default settingsSchema;