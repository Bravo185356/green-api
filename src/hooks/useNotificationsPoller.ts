import type { Credentials, TextMessageNotification } from '../types';
import { useEffect, useRef } from 'react';
import { deleteNotification, receiveNotification } from '../api/api';

const TEXT_WEBHOOKS = new Set(['incomingMessageReceived', 'outgoingMessageReceived']);

function isTextNotification(body: TextMessageNotification): boolean {
    if (!TEXT_WEBHOOKS.has(body.typeWebhook)) {
        return false;
    }
    const text = body.messageData?.textMessageData?.textMessage;
    return typeof text === 'string' && text.length > 0;
}

export function useNotificationsPoller(
    creds: Credentials | null,
    handler: (body: TextMessageNotification) => void
) {
    const handlerRef = useRef(handler);

    useEffect(() => {
        handlerRef.current = handler;
    }, [handler]);

    useEffect(() => {
        if (!creds) {
            return;
        }

        const activeCreds = creds;
        let stopped = false;

        async function loop() {
            while (!stopped) {
                try {
                    const result = await receiveNotification(activeCreds, 10);
                    if (stopped) {
                        return;
                    }

                    if (result) {
                        const { receiptId, body } = result;
                        if (body.typeWebhook === 'outgoingMessageStatus' || isTextNotification(body)) {
                            handlerRef.current(body);
                        }
                        await deleteNotification(activeCreds, receiptId);
                    }
                } catch {
                    await new Promise((r) => setTimeout(r, 3000));
                }
            }
        }

        loop();
        return () => {
            stopped = true;
        };
    }, [creds]);
}
