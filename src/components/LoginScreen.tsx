import type { Credentials } from '../types';
import { useState, type FormEvent } from 'react';
import { getStateInstance } from '../api/api';
import '../styles/LoginScreen.css';

interface Props {
    onLogin: (creds: Credentials) => void;
}

export function LoginScreen({ onLogin }: Props) {
    const [apiUrl, setApiUrl] = useState('');
    const [idInstance, setIdInstance] = useState('');
    const [apiTokenInstance, setApiTokenInstance] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);

        if (!apiUrl.trim() || !idInstance.trim() || !apiTokenInstance.trim()) {
            setError('Заполните все поля');
            return;
        }

        const creds: Credentials = {
            apiUrl: apiUrl.trim(),
            idInstance: idInstance.trim(),
            apiTokenInstance: apiTokenInstance.trim(),
        };

        setLoading(true);
        try {
            const state = await getStateInstance(creds);
            if (state.stateInstance !== 'authorized') {
                setError(
                    `Инстанс не авторизован (статус: ${state.stateInstance}). Отсканируйте QR-код в личном кабинете GREEN-API.`
                );
                setLoading(false);
                return;
            }
            onLogin(creds);
        } catch {
            setError('Не удалось подключиться. Проверьте apiUrl, idInstance и apiTokenInstance.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='login-screen'>
            <form
                className='login-card'
                onSubmit={handleSubmit}
            >
                <div className='login-logo'>WhatsApp Web Client</div>
                <p className='login-subtitle'>Введите данные вашего инстанса GREEN-API</p>
                <label className='field'>
                    <span>apiUrl</span>
                    <input
                        value={apiUrl}
                        onChange={(e) => setApiUrl(e.target.value)}
                        placeholder='https://7107.api.greenapi.com'
                    />
                </label>
                <label className='field'>
                    <span>idInstance</span>
                    <input
                        value={idInstance}
                        onChange={(e) => setIdInstance(e.target.value)}
                        placeholder='1101123456'
                    />
                </label>
                <label className='field'>
                    <span>apiTokenInstance</span>
                    <input
                        type='password'
                        value={apiTokenInstance}
                        onChange={(e) => setApiTokenInstance(e.target.value)}
                        placeholder='d75b3a66374942c5b3c019c698abc2067e151558acbd451234'
                    />
                </label>
                {error && <div className='login-error'>{error}</div>}
                <button
                    type='submit'
                    disabled={loading}
                    className='btn-primary'
                >
                    {loading ? 'Проверка...' : 'Войти'}
                </button>
            </form>
        </div>
    );
}
