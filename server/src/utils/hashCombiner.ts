import { createHash } from 'crypto';

export const generateSynastryHash = (dateA: string, dateB: string, type: string = 'ROMANTIC'): string => {
    const dates = [dateA, dateB].sort();
    const baseString = `naos_synastry_${type}_${dates[0]}_${dates[1]}`;
    return createHash('sha256').update(baseString).digest('hex');
};
