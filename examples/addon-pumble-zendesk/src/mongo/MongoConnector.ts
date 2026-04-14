import { MongoClient } from 'mongodb';
import {
    MONGO_DB_NAME,
    MONGO_URL,
} from '../config/config';
import { logger } from '../utils/Logger';

class MongoConnector {
    public readonly client: MongoClient;

    public constructor() {
        this.client = new MongoClient(MONGO_URL);
    }

    public get db() {
        return this.client.db(MONGO_DB_NAME);
    }

    public async init() {
        await this.client.connect();
        logger.info('MongoDB connected!');
    }
}

export const mongoConnector = new MongoConnector();
export const initMongoConnector = async () => {
    await mongoConnector.init();
};
