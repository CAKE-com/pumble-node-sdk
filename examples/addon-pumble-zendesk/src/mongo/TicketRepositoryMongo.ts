import {ObjectId} from "mongodb";
import {BaseRepositoryMongo} from "./BaseRepositoryMongo";
import {Comment, Ticket} from "../types";

class TicketRepositoryMongo extends BaseRepositoryMongo<Ticket> {
    protected get collectionName(): string {
        return 'ticket';
    }

    public async getTicketByIdAndChannel(
        ticketId: number,
        subdomain: string,
        channelId: ObjectId
    ): Promise<Ticket | undefined> {
        const doc = await this.collection.findOne({
            ticketId: ticketId,
            channelId: channelId,
            subdomain: subdomain
        });
        if (doc) {
            return doc;
        }
        return undefined;
    }

    public async getTicketsByTicketId(
        ticketId: number
    ): Promise<Ticket[]> {
        const docs = this.collection.find({
            ticketId: ticketId,
        });
        return await docs.toArray();
    }

    public async getTicketByMessageId(
        messageId: ObjectId
    ): Promise<Ticket | undefined> {
        const doc = await this.collection.findOne({
            messageId: messageId
        });
        if (doc) {
            return doc;
        }
        return undefined;
    }

    public async createTicket(
        ticket: Omit<Ticket, "_id">
    ): Promise<Ticket | undefined> {
        const result = await this.collection.updateOne(
            {
                ticketId: ticket.ticketId,
                channelId: ticket.channelId,
                subdomain: ticket.subdomain
            },
            {
                $set: ticket,
            },
            { upsert: true }
        );
        return result.upsertedId ? { ...ticket, _id: result.upsertedId } : undefined;
    }

    public async appendComment(
        ticketId: number,
        channelId: ObjectId,
        subdomain: string,
        comment: Comment
    ): Promise<boolean> {
        const result = await this.collection.updateOne(
            {
                ticketId: ticketId,
                channelId: channelId,
                subdomain: subdomain
            },
            {
                $addToSet: { comments: { commentId: comment.commentId, messageId: comment.messageId } },
            }
        );
        return result.acknowledged;
    }
}

export const ticketRepository = new TicketRepositoryMongo();
