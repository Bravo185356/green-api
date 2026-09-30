import type { GetChatHistoryResponse, TextMessageNotification, Credentials } from '../types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getChatHistory, getChats, sendMessage } from '../api/api';
import { mergeMessages, createEmptyChat, upsertMessage, type ChatItem } from '../utils';
import { useNotificationsPoller } from './useNotificationsPoller';

function makeId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function messageFromNotification(body: TextMessageNotification): GetChatHistoryResponse {
    const sender = body.senderData!;
    const messageData = body.messageData!;
    const type = body.typeWebhook === 'outgoingMessageReceived' ? 'outgoing' : 'incoming';
    return {
        type,
        idMessage: body.idMessage,
        timestamp: body.timestamp,
        chatId: sender.chatId,
        senderId: type === 'outgoing' ? body.instanceData.wid : sender.sender,
        senderName: sender.senderName,
        senderContactName: sender.senderContactName ?? '',
        textMessage: messageData.textMessageData.textMessage,
        description: '',
    };
}

function patchChatMessages(
    chats: ChatItem[],
    chatId: string,
    update: (messages: GetChatHistoryResponse[]) => GetChatHistoryResponse[]
): ChatItem[] {
    const index = chats.findIndex((chat) => chat.id === chatId);
    if (index === -1) {
        return chats;
    }
    const next = [...chats];
    next[index] = { ...next[index], messages: update(next[index].messages) };
    return next;
}

export function useChats(creds: Credentials | null) {
    const [chats, setChats] = useState<ChatItem[]>([]);
    const [chatsLoaded, setChatsLoaded] = useState(false);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const historyLoadedRef = useRef<Set<string>>(new Set());

    const reset = useCallback(() => {
        setChats([]);
        setChatsLoaded(false);
        setActiveChatId(null);
        historyLoadedRef.current.clear();
    }, []);

    useEffect(() => {
        async function loadChats() {
            if (!creds) {
                setChatsLoaded(false);
                return;
            }

            setChatsLoaded(false);

            const chats = await getChats(creds, 50);
            const chatsResult = chats.filter((chat) => !chat.archive).map((chat) => ({ ...chat, messages: [] }));
            setChats(chatsResult);
            setChatsLoaded(true);
        }
        loadChats();
    }, [creds]);

    const loadHistory = useCallback(
        async (chatId: string) => {
            if (!creds || historyLoadedRef.current.has(chatId)) {
                return;
            }
            historyLoadedRef.current.add(chatId);

            const items = await getChatHistory(creds, chatId, 50).catch(() => null);
            if (!items) {
                historyLoadedRef.current.delete(chatId);
                return;
            }

            const withText = items.filter((item) => item.textMessage);
            setChats((prev) =>
                patchChatMessages(prev, chatId, (currentMessages) => mergeMessages(withText, currentMessages))
            );
        },
        [creds]
    );

    useNotificationsPoller(creds && chatsLoaded ? creds : null, (body) => {
        if (body.typeWebhook === 'outgoingMessageStatus' && body.chatId && body.status) {
            setChats((prev) =>
                patchChatMessages(prev, body.chatId!, (messages) =>
                    messages.map((message) =>
                            message.idMessage === body.idMessage
                                ? { ...message, timestamp: body.timestamp, statusMessage: body.status }
                                : message).sort((a, b) => a.timestamp - b.timestamp)
                )
            );
            return;
        }

        const message = messageFromNotification(body);
        const chatId = message.chatId;

        setChats((prev) => {
            const existing = prev.find((chat) => chat.id === chatId);

            if (!existing) {
                return [...prev, { ...createEmptyChat(chatId, body.senderData?.chatName ?? ''), messages: [message] }];
            }

            return patchChatMessages(prev, chatId, (messages) => upsertMessage(messages, message));
        });
    });

    const selectChat = useCallback(
        (chatId: string) => {
            setActiveChatId(chatId);
            loadHistory(chatId);
        },
        [loadHistory]
    );

    const createChat = useCallback(
        (chatId: string) => {
            setChats((prev) => (prev.some((chat) => chat.id === chatId) ? prev : [...prev, createEmptyChat(chatId)]));
            selectChat(chatId);
        },
        [selectChat]
    );

    const sendText = useCallback(
        async (text: string) => {
            if (!creds || !activeChatId) {
                return;
            }
            const chatId = activeChatId;
            const localId = makeId();
            const optimistic: GetChatHistoryResponse = {
                type: 'outgoing',
                idMessage: localId,
                timestamp: Date.now() / 1000,
                chatId,
                senderId: '',
                senderName: '',
                senderContactName: '',
                textMessage: text,
                statusMessage: 'pending',
                description: '',
            };

            setChats((prev) => patchChatMessages(prev, chatId, (messages) => upsertMessage(messages, optimistic)));

            try {
                const { idMessage } = await sendMessage(creds, chatId, text);
                const sent: GetChatHistoryResponse = {
                    ...optimistic,
                    idMessage: idMessage || localId,
                };
                setChats((prev) =>
                    patchChatMessages(prev, chatId, (messages) =>
                        upsertMessage(
                            messages.filter((message) => message.idMessage !== localId),
                            sent
                        )
                    )
                );
            } catch {
                setChats((prev) =>
                    patchChatMessages(prev, chatId, (messages) =>
                        messages.map((message) =>
                            message.idMessage === localId ? { ...message, statusMessage: 'failed' } : message
                        )
                    )
                );
            }
        },
        [creds, activeChatId]
    );

    const activeChat = activeChatId ? (chats.find((chat) => chat.id === activeChatId) ?? null) : null;

    return { chats, activeChat, activeChatId, selectChat, createChat, sendText, reset };
}
