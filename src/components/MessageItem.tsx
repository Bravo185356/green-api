import type { GetChatHistoryResponse } from '../types';
import '../styles/MessageItem.css';

function formatTime(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

interface Props {
    message: GetChatHistoryResponse;
}

export function MessageItem({ message }: Props) {
    return (
        <div className={`message-row ${message.type === 'outgoing' ? 'outgoing' : 'incoming'}`}>
            <div className='message-item'>
                <span className='message-text'>{message.textMessage}</span>
                {message.statusMessage !== 'pending' ? <span className='message-meta'>
                    {formatTime(message.timestamp)}
                </span> : <span className='message-meta'>⏳</span>}
            </div>
        </div>
    );
}
