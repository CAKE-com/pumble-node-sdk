import {Mutex} from "async-mutex";


/**
 * This is used to synchronize the process of updating the Poll document internally.
 * Only one thread should be able to update a specific poll at a given time, ensuring that changes are not lost due to timing
 */
export class VoteSynchronizer {
    private mutexMap = new Map<string, Mutex>();

    public onNewPoll(messageId: string) {
        this.mutexMap.set(messageId, new Mutex());
    }

    public onClosedPoll(messageId: string) {
        this.mutexMap.delete(messageId);
    }

    public async runExclusively(messageId: string, fn: () => Promise<any>) {
        return this.mutexMap.get(messageId)?.runExclusive(async (): Promise<any> => {
            return await fn();
        });
    }
}

export const voteSynchronizer = new VoteSynchronizer();
