import {MongoClient} from "mongodb";
import * as console from "console";
import {MONGO_DB_NAME, MONGO_URL} from "../config";
import { Logger } from "../service/Logger";

class MongoConnector {
    private logger = Logger.getInstance(MongoConnector);
    private _client: MongoClient;

    public constructor() {
        this._client = new MongoClient(MONGO_URL);
    }

    public get db() {
        return this._client.db(MONGO_DB_NAME);
    }

    public async init() {
        await this._client.connect();
        this.logger.info("Mongo connected!");
    }


    get client(): MongoClient {
        return this._client;
    }
}

export const mongoConnector = new MongoConnector();