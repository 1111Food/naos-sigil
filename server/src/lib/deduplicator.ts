
export class RequestDeduplicator {
    private static inFlight = new Map<string, Promise<any>>();

    static async execute<T>(key: string, task: () => Promise<T>): Promise<T> {
        if (this.inFlight.has(key)) {
            // Already generating, return the existing promise so both get the same exact payload
            return this.inFlight.get(key) as Promise<T>;
        }

        const promise = task().finally(() => {
            this.inFlight.delete(key);
        });

        this.inFlight.set(key, promise);
        return promise;
    }
}

