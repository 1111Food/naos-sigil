import { Signal } from '../models/Signal';

export interface ISignalSource {
    /**
     * Given the raw profiles of two users, extract the specific 
     * signal (e.g. Astrology data) and normalize it into a Signal object.
     */
    generateSignal(userA: any, userB: any): Promise<Signal>;
}
