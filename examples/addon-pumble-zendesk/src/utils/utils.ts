import { CLIENT_ID, REDIRECT_URI, SCOPES } from '../config/config';
import { CryptoUtils } from './CryptoUtils';
import { IntegrationError } from '../types';

export const value = (obj: any): string | undefined => {
    if (!!obj && 'value' in obj) {
        return obj.value;
    }
}

export const generateRedirectUrl = (subdomain: string, workspaceId: string, workspaceUserId: string): string => {
    return `https://${subdomain}.zendesk.com/oauth/authorizations/new?response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&client_id=${CLIENT_ID}&scope=${SCOPES}&state=${CryptoUtils.getSignedState({
        subdomain: subdomain,
        workspaceId: workspaceId,
        workspaceUserId: workspaceUserId
    })}`;
}

export const timeDiffMs = (firstDate: string, secondDate: string): number => {
    return new Date(firstDate).getTime() - new Date(secondDate).getTime();
}

export const validateSubdomain = (subdomain?: string) => {
    const regex = /^[a-z0-9](?:[a-z0-9\-]{0,61}[a-z0-9])$/;
    if (!subdomain || !regex.test(subdomain)) {
        throw new IntegrationError("Invalid subdomain, enter correct subdomain in order to connect Zendesk account", 'Invalid subdomain');
    }
}

export const isAlphanumeric = (str?: string): boolean => {
    if (!str) {
        return false;
    }
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    return alphanumericRegex.test(str);
};