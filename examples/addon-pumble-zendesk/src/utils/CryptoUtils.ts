import crypto from 'crypto';
import { STATE_SECRET } from '../config/config';

export class CryptoUtils {

    public static getSignedState(payload: { subdomain: string, workspaceId: string, workspaceUserId: string }) {
        const encodedUserInfo = btoa(JSON.stringify(payload));
        const hmac = crypto.createHmac('sha256', STATE_SECRET);
        hmac.update(encodedUserInfo);
        const signature = hmac.digest('base64url');
        return encodeURIComponent(`${encodedUserInfo}.${signature}`);
    }

    public static getDecodedPayload(signedState: string): {
        subdomain: string,
        workspaceId: string,
        workspaceUserId: string
    } {
        const parts = decodeURIComponent(signedState).split('.');
        if (parts.length !== 2) {
            return { subdomain: '', workspaceId: '', workspaceUserId: '' };
        }
        const encodedUserInfo = parts[0];
        const signature = parts[1];
        const hmac = crypto.createHmac('sha256', STATE_SECRET);
        hmac.update(encodedUserInfo);
        const expectedSignature = hmac.digest('base64url');
        if (expectedSignature !== signature) {
            return { subdomain: '', workspaceId: '', workspaceUserId: '' };
        }
        return JSON.parse(atob(encodedUserInfo));
    }

    public static generateRandomAlphanumeric(length: number): string {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }
}