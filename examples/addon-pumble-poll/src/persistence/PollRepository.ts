import {Collection, ObjectId} from "mongodb";
import {mongoConnector} from "./MongoConnector";
import {Poll, Voter} from "../domain/Poll";

class PollRepository {
    static COLLECTION_NAME = "polls";

    private get collection(): Collection {
        return mongoConnector.db.collection(PollRepository.COLLECTION_NAME);
    }

    public async create(poll: Poll) {
        let insertResult = await this.collection.insertOne(poll as {});
        return (insertResult.insertedId as ObjectId);
    }

    public async getOpenPolls() {
        return await this.collection
            .find({closed: false, isPublished: true})
            .project({"messageId": 1})
            .map(doc => doc.messageId as string)
            .toArray();

    }

    public async updateById(id: string, poll: Poll) {
        await this.collection.replaceOne({
            _id: new ObjectId(id)
        }, poll as {})
    }

    public async addVoter(messageId: string, voter: Voter) {
        await this.collection.updateOne(
            {messageId: messageId,},
            {$push: {"voters": voter as any}}
        )
    }

    public async updateVoterSelections(messageId: string, userId: string, selections: string[]) {
        await this.collection.updateOne(
            {messageId: messageId, "voters.userId": userId},
            {$set: {"voters.$.selections": selections}}
        )
    }

    public async updateVoterLastVoteTime(messageId: string, userId: string) {
        await this.collection.updateOne(
            {messageId: messageId, "voters.userId": userId},
            {$set: {"voters.$.lastVoteTime": Date.now()}}
        )
    }

    public async updateVoterEphemeralMessage(messageId: string, userId: string, ephemeralMessageId: string) {
        await this.collection.updateOne(
            {messageId: messageId, "voters.userId": userId},
            {$set: {"voters.$.ephemeralMessageId": ephemeralMessageId, "voters.$.lastVoteTime": Date.now()}}
        )
    }

    public async setTargetChannelId(id: string, targetChannelId: string) {
        await this.collection.updateOne({
            _id: new ObjectId(id)
        }, {
            "$set": {targetChannelId: targetChannelId}
        })
    }

    public async setSendAsUser(id: string, sendAsUser: boolean) {
        await this.collection.updateOne({
            _id: new ObjectId(id)
        }, {
            "$set": {sentAsUser: sendAsUser}
        })
    }

    public async setIsMultiVote(id: string, isMultiVote: boolean) {
        await this.collection.updateOne({
            _id: new ObjectId(id)
        }, {
            "$set": {isMultiVote: isMultiVote}
        })
    }

    public async setEndDate(id: string, endsAt: number, endDateString: string) {
        await this.collection.updateOne({
            _id: new ObjectId(id)
        }, {
            "$set": {endsAt: endsAt, endsAtString: endDateString}
        })
    }

    public async setIsAnonymous(id: string, isAnonymous: boolean) {
        await this.collection.updateOne({
            _id: new ObjectId(id)
        }, {
            "$set": {isAnonymous: isAnonymous}
        })
    }

    public async setIsPublished(id: string, isPublished: boolean) {
        await this.collection.updateOne({
            _id: new ObjectId(id)
        }, {
            "$set": {isPublished: isPublished}
        })
    }

    public async setIsClosed(id: string, closed: boolean) {
        await this.collection.updateOne({
            _id: new ObjectId(id)
        }, {
            "$set": {closed: closed}
        })
    }

    public async updateByMessageId(messageId: string, poll: Poll) {
        await this.collection.replaceOne({
            messageId: messageId
        }, poll as {})
    }

    public async getById(id: string) {
        let result = await this.collection.find({
            _id: new ObjectId(id)
        }).toArray();

        return (result[0] as unknown as Poll);
    }

    public async getByMessageId(messageId: string) {
        let result = await this.collection.find({
            messageId: messageId
        }).toArray();

        return (result[0] as unknown as Poll);
    }

    public async getFinishedPolls() {
        let result = await this.collection.find({
            endsAt: {
                "$lte": Date.now()
            },
            closed: false,
            isPublished: true,
        }).toArray();

        return result.map(result => {
            return result as unknown as Poll
        });
    }

    public async addAnswer(messageId: string, answer: string) {
        await this.collection.updateOne(
            {messageId: messageId},
            {$push: {"answers": answer as any}}
        )
    }

    public async setAllowedNewAnswer(id: string, allowed: boolean) {
        await this.collection.updateOne({
            _id: new ObjectId(id)
        }, {
            "$set": {newAnswerAllowed: allowed}
        })
    }
}


export const repository = new PollRepository();
