import type {
    Credentials,
    GetChatHistoryResponse,
    GetChatsResponse,
    ReceiveNotificationResponse,
    SendMessageResponse,
} from '../types';

export class ApiError extends Error {
    status?: number;

    constructor(message: string, status?: number) {
        super(message);
        this.name = 'GreenApiError';
        this.status = status;
    }
}

function buildUrl(creds: Credentials, method: string, extra = ''): string {
    const base = creds.apiUrl.replace(/\/+$/, '');
    return `${base}/waInstance${creds.idInstance}/${method}/${creds.apiTokenInstance}${extra}`;
}

async function request<T>(url: string, options: RequestInit, errorMessage: string): Promise<T> {
    const res = await fetch(url, options);
    if (!res.ok) {
        throw new ApiError(`${errorMessage} (HTTP ${res.status})`, res.status);
    }
    return res.json();
}

export function getStateInstance(creds: Credentials): Promise<{ stateInstance: string }> {
    return request<{ stateInstance: string }>(
        buildUrl(creds, 'getStateInstance'),
        { method: 'GET' },
        'Не удалось проверить инстанс'
    );
}

export function sendMessage(creds: Credentials, chatId: string, message: string): Promise<SendMessageResponse> {
    return request<SendMessageResponse>(
        buildUrl(creds, 'sendMessage'),
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chatId, message }),
        },
        'Ошибка отправки сообщения'
    );
}

export async function getChats(creds: Credentials, count?: number): Promise<GetChatsResponse[]> {
    const query = typeof count === 'number' ? `?count=${count}` : '';
    const data = await request<GetChatsResponse[]>(
        buildUrl(creds, 'getChats', query),
        { method: 'GET' },
        'Не удалось получить список чатов'
    );
    return data;
}

export async function getChatHistory(
    creds: Credentials,
    chatId: string,
    count = 50
): Promise<GetChatHistoryResponse[]> {
    const data = await request<GetChatHistoryResponse[]>(
        buildUrl(creds, 'getChatHistory'),
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chatId, count }),
        },
        'Не удалось получить историю чата'
    );
    return data;
}

export async function receiveNotification(
    creds: Credentials,
    receiveTimeout = 10
): Promise<ReceiveNotificationResponse | null> {
    const res = await fetch(buildUrl(creds, 'receiveNotification', `?receiveTimeout=${receiveTimeout}`), {
        method: 'GET',
    });
    if (res.status === 204) {
        return null;
    }
    if (!res.ok) {
        throw new ApiError(`Ошибка получения уведомлений (HTTP ${res.status})`, res.status);
    }
    const data = await res.json();
    return data ?? null;
}

export function deleteNotification(creds: Credentials, receiptId: number): Promise<void> {
    return request<void>(
        buildUrl(creds, 'deleteNotification', `/${receiptId}`),
        { method: 'DELETE' },
        'Ошибка удаления уведомления'
    );
}
