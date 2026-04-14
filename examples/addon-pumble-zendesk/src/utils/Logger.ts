import winston from 'winston';

const options = {
    file: {
        level: 'info',
        filename: `./logs/app.log`,
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: false,
    },
    console: {
        level: 'info',
        handleExceptions: true,
        json: false,
        colorize: true,
    },
};

// instantiate a new Winston Logger with the settings defined above
export const logger = winston.createLogger({
    transports: [
        new winston.transports.File(options.file),
        new winston.transports.Console(options.console),
    ],
    format: winston.format.combine(
        winston.format(function dynamicContent(info: any, opts: any) {
            const now = new Date();
            info.message = '[' + now.toJSON() + '] ' + info.message;
            return info;
        })(),
        winston.format.colorize({ all: true }),
        winston.format.simple()
    ),
    exitOnError: false, // do not exit on handled exceptions
});
