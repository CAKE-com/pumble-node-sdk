import { Request, Response } from 'express';
import { OAuth2AccessTokenResponse } from './types';
import { CredentialsStore } from './stores/CredentialsStore';

export type OAuth2Config = {
    tokenStore?: CredentialsStore;
    redirect?: {
        enable: boolean;
        path?: string;
        onSuccess?: (
            result: OAuth2AccessTokenResponse,
            req: Request,
            res: Response
        ) => void;
        onError?: (error: unknown, req: Request, res: Response) => void;
    };
};
