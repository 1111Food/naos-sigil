/**
 * Protect one scheduler loop from re-entering while a previous cycle is pending.
 * Deliberately skips overlapping ticks rather than queueing stale notifications.
 *
 * In-process only: this is NOT a distributed lock or a delivery idempotency ledger.
 */
export function createSingleFlight(
    runCycle: () => Promise<unknown>
): () => Promise<boolean> {
    let inFlight = false;

    return async () => {
        if (inFlight) return false;
        inFlight = true;
        try {
            await runCycle();
            return true;
        } finally {
            inFlight = false;
        }
    };
}
