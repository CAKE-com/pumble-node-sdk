import { indexesMigration } from './IndexesMigration';
import { mongoConnector } from '../mongo/MongoConnector';
import { logger } from '../utils/Logger';

class MigrationsService {
    async runMigrations() {
        try {
            const migrations = [
                indexesMigration
            ];

            const changelogCollection = mongoConnector.db.collection('changelog');
            const db = mongoConnector.db;

            for (const migration of migrations) {
                const migrationDocument = await changelogCollection.findOne({ migrationId: await migration.getMigrationId() });

                if (migrationDocument) {
                    continue;
                }

                await migration.migrate(db);
                await migration.logMigration(changelogCollection);
            }
            logger.info('Migrations done.');
        } catch (e) {
            logger.error(`Error while running migrations`, e);
        }
    }
}

export const migrationsService = new MigrationsService();