interface Credentials {
    apiUrl: string;
    idInstance: string;
    apiTokenInstance: string;
}

interface SendMessageRequest {
    chatId: string;
    message: string;
}

interface SendMessageResponse {
    idMessage: string;
}

interface GetChatsResponse {
    archive: boolean;
    id: string;
    ephemeralExpiration: number;
    ephemeralSettingTimestamp: number;
    name: string;
    type: string;
    unreadCount: number;
    newChatId: string;
}

interface GetChatHistoryResponse {
    type: 'outgoing' | 'incoming';
    idMessage: string;
    timestamp: number;
    chatId: string;
    senderId: string;
    senderName: string;
    senderContactName: string;
    textMessage: string;
    statusMessage?: 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'suspended';
    description: string;
}

interface ReceiveNotificationResponse {
    receiptId: number;
    body: TextMessageNotification;
}

interface TextMessageNotification {
    typeWebhook: string;
    instanceData: {
        idInstance: number;
        wid: string;
        typeInstance: string;
    };
    timestamp: number;
    idMessage: string;
    chatId?: string;
    status?: 'sent' | 'delivered' | 'read' | 'failed';
    senderData?: {
        chatId: string;
        sender: string;
        chatName: string;
        senderName: string;
        senderContactName: string;
    };
    messageData?: {
        typeMessage: string;
        textMessageData: {
            textMessage: string;
        };
    };
}

export type {
    Credentials,
    GetChatsResponse,
    SendMessageRequest,
    SendMessageResponse,
    GetChatHistoryResponse,
    ReceiveNotificationResponse,
    TextMessageNotification,
};
