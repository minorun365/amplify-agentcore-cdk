import { useRef, useEffect } from 'react';
import { useChat } from './hooks/useChat';
import { MessageBubble } from './components/MessageBubble';
import { ChatInput } from './components/ChatInput';
import './App.css';

// メインのアプリケーションコンポーネント
function App() {
  const { messages, loading, sendMessage } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // メッセージ追加時に自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="container">
      <header className="header">
        <h1 className="title">フルサーバーレスなAIエージェントアプリ</h1>
        <p className="subtitle">AmplifyとAgentCoreで構築しています</p>
      </header>

      <div className="message-area">
        <div className="message-container">
          {messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <ChatInput onSend={sendMessage} disabled={loading} />
    </div>
  );
}

export default App;
