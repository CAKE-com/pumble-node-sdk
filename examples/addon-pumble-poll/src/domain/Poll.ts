export type Poll = {
    pollId?: string;
    workspaceId: string;
    channelId: string;
    messageId?: string;
    ephemeralMessageId?: string;
    userTimezoneId?: string;
    userId: string;
    createdAt: number;
    endsAt: number;
    endsAtString: string
    question: string;
    answers: string[];
    isAnonymous: boolean;
    isMultiVote: boolean;
    closed: boolean;
    isPublished: boolean;
    sentAsUser?: boolean;
    targetChannelId: string;
    voters: Voter[]
    newAnswerAllowed: boolean;
}


export type Voter = {
    userId: string;
    lastVoteTime?: number;
    ephemeralMessageId?: string;
    selections: string[];
}