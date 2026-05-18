import { Logger } from "./Logger";

class SimpleExpiringSet {
    private logger = Logger.getInstance(SimpleExpiringSet);
    private data = new Map<string, number>();
    private readonly expirationMs: number = 120 * 1000;
    private readonly sweepIntervalMs: number = 5 * 1000;
    private sweepTimer: ReturnType<typeof setInterval>; // No `null` as it's always started

    constructor() {
        this.sweepTimer = setInterval(() => {
            this.performSweep();
        }, this.sweepIntervalMs);

        this.logger.info(`Started sweeping every ${this.sweepIntervalMs / 1000} seconds.`);
    }

    private performSweep(): void {
        const now = Date.now();
        let removedCount = 0;

        for (const [key, addedAt] of this.data.entries()) {
            if (now - addedAt > this.expirationMs) {
                this.data.delete(key);
                removedCount++;
            }
        }
    }

    add(element: string): void {
        this.data.set(element, Date.now());
    }

    generateRandomElement(): string {
        const element = this.generateRandomString(12);
        this.data.set(element, Date.now());
        return element;
    }

    has(element?: string): boolean {
        if (!element) {
            return false;
        }
        const addedAt = this.data.get(element);
        if (addedAt === undefined) {
            return false;
        }
        return (Date.now() - addedAt) <= this.expirationMs;
    }

    private generateRandomString(length: number): string {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0987654321';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
}

export const simpleExpiringSet = new SimpleExpiringSet();