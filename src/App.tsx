import type { Credentials } from './types';
import { useState } from 'react';
import { ChatWindow } from './components/ChatWindow';
import { LoginScreen } from './components/LoginScreen';
import { NewChatModal } from './components/NewChatModal';
import { Sidebar } from './components/Sidebar';
import { useChats } from './hooks/useChats';

function App() {
    const [creds, setCreds] = useState<Credentials | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const { chats, activeChat, activeChatId, selectChat, createChat, sendText, reset } = useChats(creds);

    function handleLogin(newCreds: Credentials) {
        setCreds(newCreds);
    }

    function handleLogout() {
        setCreds(null);
        reset();
    }

    function handleCreateChat(chatId: string) {
        createChat(chatId);
        setModalOpen(false);
    }

    if (!creds) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    return (
        <div className='app'>
            <Sidebar
                chats={chats}
                activeChatId={activeChatId}
                onSelect={selectChat}
                onNewChat={() => setModalOpen(true)}
                onLogout={handleLogout}
            />
            <ChatWindow
                chat={activeChat}
                onSend={sendText}
            />
            {modalOpen && (
                <NewChatModal
                    onCreate={handleCreateChat}
                    onClose={() => setModalOpen(false)}
                />
            )}
        </div>
    );
}

export default App;
