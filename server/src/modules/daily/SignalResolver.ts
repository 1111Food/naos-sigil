import { DailyContextLayerA, DailySignal } from './types';

export class SignalResolver {
    /**
     * Resolves an array of signal IDs to their full DailySignal factual objects from Layer A.
     */
    static resolve(signalIds: string[], layerA: DailyContextLayerA): DailySignal[] {
        if (!signalIds || !layerA || !layerA.provenance) return [];
        
        const map = new Map(layerA.provenance.map(p => [p.id, p]));
        const resolved: DailySignal[] = [];

        for (const id of signalIds) {
            const signal = map.get(id);
            if (signal) {
                resolved.push(signal);
            }
        }

        return resolved;
    }

    /**
     * Resolves a single signal ID.
     */
    static resolveOne(signalId: string, layerA: DailyContextLayerA): DailySignal | undefined {
        return this.resolve([signalId], layerA)[0];
    }
}
