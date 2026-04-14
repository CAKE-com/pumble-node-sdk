import { Collection } from 'mongodb';
import {mongoConnector} from "./MongoConnector";

export abstract class BaseRepositoryMongo<T extends Record<string, unknown>> {
    protected abstract get collectionName(): string;

    protected get collection(): Collection<T> {
        return mongoConnector.db.collection<T>(this.collectionName);
    }
}
