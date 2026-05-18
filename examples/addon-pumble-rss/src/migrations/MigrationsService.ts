import { Logger } from "../utils/Logger";
import { mongoConnector } from "../clients/MongoConnector";
import { RUN_MIGRATIONS } from "../config/config";
import { Migration } from "./Migration";
import { homeViewNotificationMigration } from "./HomeViewNotificationMigration";
import {welcomeMessagesIndexMigration} from "./WelcomeMessagesIndexMigration";
import {populateWelcomeMessagesMigration} from "./PopulateWelcomeMessagesMigration";

const logger = Logger.getInstance('migrations');

class MigrationsService {
    async runMigrations() {    
        try {
            var migrations: Migration[] = [
                homeViewNotificationMigration,
                welcomeMessagesIndexMigration,
                populateWelcomeMessagesMigration,
            ];

            if (!RUN_MIGRATIONS) {
                logger.info(`Skipping migrations...`);
                return;
            }
            
            const changelogCollection = mongoConnector.db.collection("changelog");
            const db = mongoConnector.db;
            migrations.forEach(async (migration) => {
                const migrationDocument = await changelogCollection.findOne({migrationId: await migration.getMigrationId()});
        
                if (migrationDocument) {
                    logger.info(`Skipping ${migration.getMigrationId()} because it is executed already...`);
                    return;
                }
        
                logger.info(`Starting migration ${await migration.getMigrationId()}...`)
                await migration.migrate(db);
        
                await migration.logMigration(changelogCollection);
                logger.info(`Finished and saved migration ${await migration.getMigrationId()}...`)
            });
        } catch (e) {
            logger.error(`Error while running migrations`, e);
        }
    }
}


export const migrationsService = new MigrationsService();