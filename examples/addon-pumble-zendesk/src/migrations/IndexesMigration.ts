import { Db } from 'mongodb';
import { Migration } from './Migration';

class IndexesMigration extends Migration {

    async getMigrationId(): Promise<string> {
        return '68a3a2600000000000000000_indexesMigration';
    }

    async migrate(db: Db) {
        const authCollection = db.collection('auth');
        const channelSubsCollection = db.collection('channel_subscription');
        const ticketCollection = db.collection('ticket');
        const webhookCollection = db.collection('webhook');
        const welcomeMessageCollection = db.collection("welcome_message");

        await authCollection.createIndexes([
            { key: { workspaceId: 1, workspaceUserId: 1 } },
            { key: { refreshTokenExpiresAt: 1 } },
            { key: { userId: 1 } }
        ]);

        await channelSubsCollection.createIndexes([
            { key: { subdomain: 1 } },
            { key: { workspaceId: 1 } }
        ]);

        await ticketCollection.createIndex({ ticketId: 1, channelId: 1 });
        await ticketCollection.createIndex({ messageId: 1 });

        await webhookCollection.createIndexes([
            { key: { code: 1 } },
            { key: { workspaceId: 1 } },
            { key: { subdomain: 1 } }
        ]);

        await welcomeMessageCollection.createIndex({ workspaceId: 1 });
    }
}

export const indexesMigration = new IndexesMigration();