import {Migration} from "./Migration";
import {Db} from "mongodb";

class WelcomeMessagesIndexMigration extends Migration {
    async getMigrationId(): Promise<string> {
        return "6977f1f00000000000000000_welcomeMessagesIndexMigration";
    };

    async migrate(db: Db) {
        const collection = db.collection("welcome_message");
        await collection.createIndex({ workspaceId: 1 });
    }
}

export const welcomeMessagesIndexMigration = new WelcomeMessagesIndexMigration();