import winston from 'winston';
import { LOG_LEVEL } from '../config';

export interface Type<T extends unknown = unknown> extends Function {
    new (...args: any[]): T;
}

export class Logger {
    public static getInstance(cl: Type | string) {
        return winston.createLogger({
            level: LOG_LEVEL,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.metadata(),
                winston.format.json()
            ),
            defaultMeta: { class: typeof cl === 'string' ? cl : cl.name },
            transports: [new winston.transports.Console({ debugStdout: true })],
        });
    }
}
