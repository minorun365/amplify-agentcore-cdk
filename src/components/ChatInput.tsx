import { useState, type FormEvent } from 'react';

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled: boolean;
}

// チャット入力フォームコンポーネント
export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;

    onSend(input.trim());
    setInput('');
  };

  return (
    <div className="form-wrapper">
      <form onSubmit={handleSubmit} className="form">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="メッセージを入力..."
          disabled={disabled}
          className="input"
        />
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="button"
        >
          {disabled ? '⌛️' : '送信'}
        </button>
      </form>
    </div>
  );
}