import {V1} from "pumble-sdk";
import SendMessagePayload = V1.SendMessagePayload;
import {ObjectId} from "mongodb";

export class IntegrationError extends Error {
    errorMessage: SendMessagePayload;

    constructor(errorMessage: SendMessagePayload, message: string) {
        super(message);
        this.errorMessage = errorMessage;
        Object.setPrototypeOf(this, IntegrationError.prototype);
    }
}

export type ZendeskAuth = {
    _id: ObjectId;
    workspaceId: ObjectId;
    workspaceUserId: ObjectId;
    subdomain: string;
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    refreshTokenExpiresAt: number;
    scope: string;
    tokenType: string
    userId: number
    email: string
};

export type Comment = {messageId: ObjectId, commentId: number};

export type Ticket = {
    _id: ObjectId;
    ticketId: number;
    subdomain?: string;
    messageId?: ObjectId;
    channelId?: ObjectId;
    workspaceId: ObjectId;
    workspaceUserId: ObjectId;
    comments: Comment[]
}

export type ChannelSubscription = {
    _id: ObjectId;
    workspaceId: ObjectId;
    channelId: ObjectId;
    subdomain: string;
    filters?: string;
};

export type WebhookSubscription = {
    _id: ObjectId;
    externalId: string;
    subdomain: string;
    code: string;
    workspaceId: ObjectId;
}

export type WelcomeMessage = {
    _id: ObjectId;
    workspaceId: ObjectId;
    workspaceUserId: ObjectId;
}


export type TicketPayload = {
    actor_id: string;
    assignee_id: string;
    brand_id: string;
    created_at: string;
    custom_status: string;
    description: string;
    external_id: null | string;
    form_id: string;
    group_id: string;
    id: string;
    is_public: boolean;
    organization_id: string;
    priority: string;
    requester_id: string;
    status: string;
    subject: string;
    submitter_id: string;
    tags: null | string[];
    type: null | string;
    updated_at: string;
    via: {channel: string};
}

export type CommentPayload = {
    id: string;
    body: string;
    is_public: boolean;
    author: { id: string; name: string }
}

export type TicketField = {
    id: string;
    active: boolean;
    description: string;
    title: string;
    type: string;
    url: string;
    visible_in_portal: boolean;
    custom_field_options: any;
    system_field_options: any;
}

export type ZendeskUserData = {
    user: {
        id: string;
        organization_id: string;
        email: string;
        name: string;
    }
}

export type ZendeskUsersData = {
    users: {
        id: string;
        name: string;
    }[]
}

export type ZendeskGroupsData = {
    groups: {
        id: string;
        name: string;
    }[]
}