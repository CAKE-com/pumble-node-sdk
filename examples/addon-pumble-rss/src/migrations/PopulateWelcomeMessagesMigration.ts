import {Migration} from "./Migration";
import {Db, ObjectId, Document} from "mongodb";
import {Logger} from "../utils/Logger";

class PopulateWelcomeMessagesMigration extends Migration {

    private logger = Logger.getInstance('PopulateWelcomeMessagesMigration');

    async getMigrationId(): Promise<string> {
        return "697943700000000000000000_populateWelcomeMessagesMigration";
    };

    async migrate(db: Db) {
        const batchSize = 250;
        const welcomeMessagesCollection = db.collection("welcome_message");
        const credentialsCollection = db.collection("credentials");

        let counter = 0;
        let progress = 0;
        let welcomeMessagesToInsert: Document[] = [];
        const credentialsResult = credentialsCollection.find({ isBot: false }).batchSize(batchSize);
        while (await credentialsResult.hasNext()) {
            const credentialsDoc = await credentialsResult.next();

            if (credentialsDoc) {
                welcomeMessagesToInsert.push({
                    _id: new ObjectId(),
                    workspaceId: ObjectId.createFromHexString(credentialsDoc.workspaceId),
                    workspaceUserId: ObjectId.createFromHexString(credentialsDoc.userId)
                });
            }

            if (++counter % batchSize === 0 || !await credentialsResult.hasNext()) {
                const result = await welcomeMessagesCollection.insertMany(welcomeMessagesToInsert);
                this.logger.info(`Inserted ${++progress}th batch of welcome_message documents of size ${result.insertedCount}`);

                welcomeMessagesToInsert = [];
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
    }
}

export const populateWelcomeMessagesMigration = new PopulateWelcomeMessagesMigration();