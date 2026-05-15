import {mongoConnector} from "./MongoConnector";
import {MongoDbTokenStore} from "pumble-sdk";
import {MONGO_DB_NAME} from "../config";

export const pumbleCredentialsRepositoryMongo = new MongoDbTokenStore(
    mongoConnector.client,
    MONGO_DB_NAME,
    'poll_addon_credentials'
);
