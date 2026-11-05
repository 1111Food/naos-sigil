/**
 * Delivery outcome is about Telegram transport, NOT whether the scheduled
 * habit was checked or written to an internal log.
 */
export type ProactiveDeliveryStatus = 'sent' | 'failed' | 'unlinked';

export function getProactiveDeliveryStatus(
    hasTelegramChat: boolean,
    telegramReportedSent: boolean
): ProactiveDeliveryStatus {
    if (!hasTelegramChat) return 'unlinked';
    return telegramReportedSent ? 'sent' : 'failed';
}

export function deliveryReceipt(status: ProactiveDeliveryStatus) {
    return {
        content: [{ type: 'text' as const, text: 'TELEGRAM_DELIVERY_' + status.toUpperCase() }],
        isError: status !== 'sent',
    };
}
