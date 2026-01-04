import ReactMarkdown from 'react-markdown';
import type { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
}

// メッセージの吹き出しを表示するコンポーネント
export function MessageBubble({ message }: MessageBubbleProps) {
  const { role, content, isToolUsing, toolCompleted, toolName } = message;

  return (
    <div className={`message-row ${role}`}>
      <div className={`bubble ${role}`}>
        {/* アシスタントが考え中の表示 */}
        {role === 'assistant' && !content && !isToolUsing && (
          <span className="thinking">考え中…</span>
        )}

        {/* ツール使用状態の表示 */}
        {isToolUsing && (
          <span className={`tool-status ${toolCompleted ? 'completed' : 'active'}`}>
            {toolCompleted ? '✓' : '⏳'} {toolName}
            {toolCompleted ? 'ツールを利用しました' : 'を利用中...'}
          </span>
        )}

        {/* メッセージ本文（Markdown対応） */}
        {content && !isToolUsing && <ReactMarkdown>{content}</ReactMarkdown>}
      </div>
    </div>
  );
}