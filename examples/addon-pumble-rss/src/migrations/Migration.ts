import { Collection, Db, ObjectId } from "mongodb";

export class Migration {
    async migrate(db: Db) {
        throw Error("This method is not implemented yet.");
    };

    async getMigrationId(): Promise<string> {
        throw Error("This method is not implemented yet.");
    };

    async logMigration(collection: Collection) {
        collection.insertOne({
            _id: new ObjectId(),
            migrationId: await this.getMigrationId()
        })
    }
}