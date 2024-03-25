import { NextFunction, Request, RequestHandler, Response } from 'express';
import crypto from 'crypto';

interface RequestWithRawBody extends Request {
    rawBody: string;
}

export function rawBody(): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
        const request = req as RequestWithRawBody;
        request.rawBody = '';
        request.on('data', (chunk) => {
            request.rawBody += chunk;
        });
        request.on('end', () => {
            request.body = JSON.parse(request.rawBody);
            next();
        });
    };
}

export function verifySignature(signingSecret: string): RequestHandler {
    const TIMESTAMP_HEADER = 'x-pumble-request-timestamp';
    const SIGNATURE_HEADER = 'x-pumble-request-signature';
    return (request: Request, res: Response, next: NextFunction) => {
        const timestamp = request.headers[TIMESTAMP_HEADER];
        const signature = request.headers[SIGNATURE_HEADER];
        if (!timestamp || !signature) {
            res.status(403).send('Invalid signature!');
            return;
        }
        const rawBody = (request as RequestWithRawBody).rawBody;
        const signingPayload = `${timestamp}:${rawBody}`;
        const hmac = crypto.createHmac('sha256', signingSecret);
        const testSignature = hmac
            .update(signingPayload)
            .digest()
            .toString('hex');
        if (testSignature !== signature) {
            res.status(403).send('Invalid signature!');
            return;
        }
        next();
    };
}
