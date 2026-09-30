import type { ChatItem } from '../utils';
import '../styles/Sidebar.css';
import { chatIdToPhone } from '../utils';

interface Props {
    chats: ChatItem[];
    activeChatId: string | null;
    onSelect: (chatId: string) => void;
    onNewChat: () => void;
    onLogout: () => void;
}

export function Sidebar({ chats, activeChatId, onSelect, onNewChat, onLogout }: Props) {
    return (
        <div className='sidebar'>
            <div className='sidebar-header'>
                <span>Чаты</span>
                <div className='sidebar-header-actions'>
                    <button
                        className='icon-btn'
                        title='Новый чат'
                        onClick={onNewChat}
                    >
                        +
                    </button>
                    <button
                        className='icon-btn'
                        title='Выйти'
                        onClick={onLogout}
                    >
                        ⎋
                    </button>
                </div>
            </div>
            <div className='chat-list'>
                {chats.length === 0 && <div className='empty-hint'>Нет чатов. Создайте новый.</div>}
                {chats.map((chat) => {
                    const phone = chatIdToPhone(chat.id);
                    return (
                        <div
                            key={chat.id}
                            className={`chat-list-item ${chat.id === activeChatId ? 'active' : ''}`}
                            onClick={() => onSelect(chat.id)}
                        >
                            <div className='avatar'>{phone.slice(-2)}</div>
                            <div className='chat-list-item-info'>
                                <div className='chat-list-item-title'>{chat.name || `+${phone}`}</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
