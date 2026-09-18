import { ChineseAdapter } from './server/src/modules/signalEngine/adapters/ChineseAdapter';
import { ChineseMathV1 } from './server/src/modules/chinese/ChineseMathV1';

const dates = [
    '2024-02-03',
    '2024-02-04',
    '2024-06-01',
    '2025-02-03',
    '2025-02-04'
];

for (const d of dates) {
    const math = ChineseMathV1.calculate(`${d}T00:00:00Z`);
    const signal = ChineseAdapter.adaptAnnual(
        { animal: math.animal, element: math.element, year: math.effectiveChineseCycleYear },
        d,
        '2026-09-15T00:00:00Z'
    );
    console.log(`${d} -> ID: ${signal.id} | Valid: ${signal.payload?.periodValidity?.validFrom} to ${signal.payload?.periodValidity?.validUntil} | effectiveYear: ${signal.payload?.effectiveChineseCycleYear}`);
}
