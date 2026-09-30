import { useEffect, useRef, useState, type FormEvent } from 'react';
import { chatIdToPhone, type ChatItem } from '../utils';
import { MessageItem } from './MessageItem';
import '../styles/ChatWindow.css';

interface Props {
    chat: ChatItem | null;
    onSend: (text: string) => void;
}

export function ChatWindow({ chat, onSend }: Props) {
    const [text, setText] = useState('');
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
    }, [chat?.messages.length]);

    if (!chat) {
        return (
            <div className='chat-window chat-window-empty'>
                <div>Выберите чат или создайте новый, чтобы начать переписку</div>
            </div>
        );
    }

    const phone = chatIdToPhone(chat.id);

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        const trimmed = text.trim();
        if (!trimmed) {
            return;
        }
        onSend(trimmed);
        setText('');
    }

    return (
        <div className='chat-window'>
            <div className='chat-window-header'>
                <div className='avatar'>{phone.slice(-2)}</div>
                <div>{chat.name || `+${phone}`}</div>
            </div>

            <div
                className='message-list'
                ref={listRef}
            >
                {chat.messages.map((message) => (
                    <MessageItem
                        key={message.idMessage}
                        message={message}
                    />
                ))}
            </div>

            <form
                className='message-input-bar'
                onSubmit={handleSubmit}
            >
                <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder='Введите сообщение'
                    autoComplete='off'
                />
                <button
                    type='submit'
                    className='btn-primary'
                    disabled={!text.trim()}
                >
                    Отправить
                </button>
            </form>
        </div>
    );
}
