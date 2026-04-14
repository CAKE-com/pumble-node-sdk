import {ObjectId} from "mongodb";
import {BaseRepositoryMongo} from "./BaseRepositoryMongo";
import {ZendeskAuth} from "../types";

class AuthRepositoryMongo extends BaseRepositoryMongo<ZendeskAuth> {
    protected get collectionName(): string {
        return 'auth';
    }

    public async getAuth(
        workspaceId: ObjectId,
        workspaceUserId: ObjectId
    ): Promise<ZendeskAuth | undefined> {
        const doc = await this.collection.findOne({
            workspaceId: workspaceId,
            workspaceUserId: workspaceUserId,
        });
        if (doc) {
            return doc;
        }
        return undefined;
    }

    public async getAnyWsAuth(
        workspaceId: ObjectId
    ): Promise<ZendeskAuth | undefined> {
        const doc = await this.collection.findOne({
            workspaceId: workspaceId,
            refreshTokenExpiresAt: { $gt: (new Date().getTime()) }
        }, {sort: {_id: -1}});
        if (doc) {
            return doc;
        }
        return undefined;
    }

    public async getAuths(
        workspaceId: ObjectId,
        subdomain: string
    ): Promise<ZendeskAuth[]> {
        return await this.collection.find({
            workspaceId: workspaceId,
            subdomain: subdomain,
        }).toArray();
    }

    public async getAuthsByZendeskUserId(
        zendeskUserId: number
    ): Promise<ZendeskAuth[]> {
        return await this.collection.find({
            userId: zendeskUserId
        }).toArray();
    }

    public async getAuthsThatExpireSoon(
        expirationTarget: number
    ): Promise<ZendeskAuth[]> {
        return await this.collection.find({
            refreshTokenExpiresAt: { $lt: expirationTarget }
        }).toArray();
    }

    public async getAuthByWorkspaceAndZendeskUserId(
        workspaceId: ObjectId,
        userId: number
    ): Promise<ZendeskAuth | undefined> {
        const doc = await this.collection.findOne({
            workspaceId: workspaceId,
            userId: userId
        });
        if (doc) {
            return doc;
        }
        return undefined;
    }

    public async addAuth(
        zendeskAuth: Omit<ZendeskAuth, "_id">,
    ): Promise<boolean> {
        const result = await this.collection.updateOne(
            {
                workspaceId: zendeskAuth.workspaceId,
                workspaceUserId: zendeskAuth.workspaceUserId
            },
            {
                $set: zendeskAuth,
            },
            { upsert: true }
        );
        return result.acknowledged;
    }

    public async updateTokens(
        auth: ZendeskAuth,
        newAccessToken: string,
        newRefreshToken: string,
        expiresAt: number,
        refreshTokenExpiresAt: number
    ): Promise<Boolean> {
        const result = await this.collection.updateOne(
            {
                workspaceId: auth.workspaceId,
                workspaceUserId: auth.workspaceUserId,
                refreshToken: auth.refreshToken,
            },
            {
                $set: {
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken,
                    expiresAt: expiresAt,
                    refreshTokenExpiresAt: refreshTokenExpiresAt
                },
            }
        );
        return result.acknowledged;
    }

    public async updateAuth(
        auth: ZendeskAuth,
    ): Promise<boolean> {
        const result = await this.collection.updateOne(
            {
                workspaceId: auth.workspaceId,
                workspaceUserId: auth.workspaceUserId,
            },
            {
                $set: auth,
            }
        );
        return result.acknowledged;
    }

    public async deleteAuth(
        workspaceId: ObjectId,
        workspaceUserId: ObjectId
    ): Promise<boolean> {
        const result = await this.collection.deleteOne(
            {
                workspaceId: workspaceId,
                workspaceUserId: workspaceUserId,
            }
        );
        return result.deletedCount > 0;
    }

    public async deleteAuths(
        workspaceId: ObjectId,
    ): Promise<boolean> {
        const result = await this.collection.deleteMany(
            {
                workspaceId: workspaceId
            }
        );
        return result.acknowledged;
    }
}

export const authRepositoryMongo = new AuthRepositoryMongo();
