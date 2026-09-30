import { useState, type FormEvent } from 'react';
import { phoneToChatId } from '../utils';
import '../styles/NewChatModal.css';

interface Props {
    onCreate: (chatId: string) => void;
    onClose: () => void;
}

export function NewChatModal({ onCreate, onClose }: Props) {
    const [phone, setPhone] = useState('');
    const [error, setError] = useState<string | null>(null);

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        const chatId = phoneToChatId(phone);
        if (!chatId) {
            setError('Введите корректный номер телефона (только цифры, с кодом страны)');
            return;
        }
        onCreate(chatId);
    }

    return (
        <div
            className='modal-overlay'
            onClick={onClose}
        >
            <form
                className='modal-card'
                onClick={(e) => e.stopPropagation()}
                onSubmit={handleSubmit}
            >
                <h3>Новый чат</h3>
                <label className='field'>
                    <span>Номер телефона получателя</span>
                    <input
                        autoFocus
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder='79876543210'
                    />
                </label>
                {error && <div className='login-error'>{error}</div>}
                <div className='modal-actions'>
                    <button
                        type='button'
                        className='btn-secondary'
                        onClick={onClose}
                    >
                        Отмена
                    </button>
                    <button
                        type='submit'
                        className='btn-primary'
                    >
                        Создать чат
                    </button>
                </div>
            </form>
        </div>
    );
}
