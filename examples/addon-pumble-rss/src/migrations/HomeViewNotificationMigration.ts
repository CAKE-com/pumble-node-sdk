import { Db } from "mongodb";
import { Migration } from "./Migration";
import { ApiClient, OAuth2Client } from "pumble-sdk";
import { ADDON_APP_KEY, ADDON_CLIENT_ID, ADDON_CLIENT_SECRET } from "../config/config";
import { Logger } from "../utils/Logger";


class HomeViewNotificationMigration extends Migration {
    private logger = Logger.getInstance('HomeViewNotificationMigration');
    
    async getMigrationId(): Promise<string> {
        return "693758700000000000000000_homeViewNotificationMigration";
    };

    async migrate(db: Db) {
        const message = "Hi there :wave:\n" +
  "Introducing your new Home tab :tada:\n\n" +
  "We’ve added the Home tab to make managing your RSS feeds simpler and more efficient.\n" +
  "Visit it now to add or remove feeds and view all your subscribed feeds in channels - all in one place.";

        let batchSize = 100, processed = 0, authorizationsBatchSize = 20;

        const botAutorizations = await db.collection("credentials").find({isBot: true}).batchSize(batchSize);

        while (await botAutorizations.hasNext()) {
            const botDocument = await botAutorizations.next();

            if (!botDocument) {
                continue;
            }

            this.logger.info(`Processing for ${botDocument.workspaceId} workspace...`);

            var botAuth = new OAuth2Client(
                ADDON_CLIENT_ID,
                ADDON_CLIENT_SECRET,
                ADDON_APP_KEY,
                botDocument.accessToken
            );

            var botClient = new ApiClient(botAuth, botDocument.workspaceId, botDocument.userId);

            const userAuthorizations = db.collection("credentials")
                .find({workspaceId: botDocument.workspaceId, isBot: false})
                .batchSize(authorizationsBatchSize);

            while (await userAuthorizations.hasNext()) {
                const userAuthDocument = await userAuthorizations.next();

                if (!userAuthDocument) {
                    continue;
                }

                this.logger.info(`Processing for ${userAuthDocument.userId} user on ${userAuthDocument.workspaceId} workspace...`);

                try {
                    await botClient.v1.messages.dmUser(userAuthDocument.userId, message);
                } catch (e: any) {
                    this.logger.error(`Error while sending message to ${userAuthDocument.userId}, ${e.status} ${e.statusText}`);
                }

                if (++processed % authorizationsBatchSize == 0) {
                    await new Promise(resolve => setTimeout(resolve, 1500));
                }
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    };
}

export const homeViewNotificationMigration = new HomeViewNotificationMigration();