import { start } from "pumble-sdk";
import { addon } from "./addon";
import { initMongoConnector, mongoConnector } from "./clients/MongoConnector";
import { startJob } from "./job/RssParserJob";
import { Logger } from "./utils/Logger";
import { migrationsService } from "./migrations/MigrationsService";

const logger = Logger.getInstance('main');

async function main() {
    await initMongoConnector();
    migrationsService.runMigrations();
    start(addon);
    startJob();
}

main().catch(() => logger.error);