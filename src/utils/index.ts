import type { GetChatHistoryResponse, GetChatsResponse } from '../types';

export type ChatItem = GetChatsResponse & {
    messages: GetChatHistoryResponse[];
};

export function phoneToChatId(input: string): string | null {
    const digits = input.replace(/\D/g, '');
    if (digits.length >= 5) {
        return `${digits}@c.us`;
    }
    return null;
}

export function chatIdToPhone(chatId: string): string {
    return chatId.replace(/@(c|g)\.us$/, '');
}

export function createEmptyChat(id: string, name = ''): ChatItem {
    return {
        id,
        name,
        type: 'user',
        archive: false,
        unreadCount: 0,
        ephemeralExpiration: 0,
        ephemeralSettingTimestamp: 0,
        newChatId: '',
        messages: [],
    };
}

export function mergeMessages(
    history: GetChatHistoryResponse[],
    currentMessages: GetChatHistoryResponse[]
): GetChatHistoryResponse[] {
    const ids = new Set(history.map((message) => message.idMessage));
    const current = currentMessages.filter((message) => !ids.has(message.idMessage));
    return [...history, ...current].sort((a, b) => a.timestamp - b.timestamp);
}

export function upsertMessage(
    messages: GetChatHistoryResponse[],
    message: GetChatHistoryResponse
): GetChatHistoryResponse[] {
    const rest = messages.filter((m) => m.idMessage !== message.idMessage);
    return [...rest, message].sort((a, b) => a.timestamp - b.timestamp);
}

