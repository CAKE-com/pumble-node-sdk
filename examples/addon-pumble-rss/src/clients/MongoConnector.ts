import { MongoClient } from 'mongodb';
import { MONGO_DB_NAME, MONGO_URL } from '../config/config';
import { Logger } from '../utils/Logger';

class MongoConnector {
    public readonly client: MongoClient;
    private logger = Logger.getInstance(MongoConnector);

    public constructor() {
        this.client = new MongoClient(MONGO_URL);
    }

    public get db() {
        return this.client.db(MONGO_DB_NAME);
    }

    public async init() {
        await this.client.connect();
        await this.ensureIndexes();
        this.logger.info('MongoDB connected!');
    }

    public async ensureIndexes() {
        await this.db
            .collection("subscribed_feed")
            .createIndex({ workspaceId: 1, channelId: 1 });
    }
}

export const mongoConnector = new MongoConnector();
export const initMongoConnector = async () => {
    await mongoConnector.init();
};
