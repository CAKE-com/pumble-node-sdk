import { green, red, yellow } from 'ansis';

class Logger {
    public info(...value: any[]) {
        console.log(...value);
    }
    public success(value: string) {
        console.log('✅ ' + green`${value}`);
    }
    public error(value: string) {
        console.log('❌ ' + red`${value}`);
    }
    public warning(value: string) {
        console.log('❗ ' + yellow`${value}`);
    }
}

export const logger = new Logger();
