import { useState, useRef, useEffect, type FormEvent } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';
import ReactMarkdown from 'react-markdown';

const AGENT_ARN = 'arn:aws:bedrock-agentcore:ap-northeast-1:282048599344:runtime/update_checker5-z2wZOT4cqn';
const REGION = 'ap-northeast-1';

// チャットメッセージの型定義
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isToolUsing?: boolean;
  toolCompleted?: boolean;
  toolName?: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // メッセージ追加時に自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // フォーム送信処理
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    // ユーザーメッセージを作成
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim()
    };

    // メッセージ配列に追加（ユーザー発言 + 空のAI応答）
    setMessages(prev => [
      ...prev,
      userMessage,
      { id: crypto.randomUUID(), role: 'assistant', content: '' }
    ]);
    setInput('');
    setLoading(true);

    // Cognito認証トークンを取得
    const session = await fetchAuthSession();
    const accessToken = session.tokens?.accessToken?.toString();

    // AgentCore Runtime APIを呼び出し
    const url = `https://bedrock-agentcore.${REGION}.amazonaws.com/runtimes/${encodeURIComponent(AGENT_ARN)}/invocations?qualifier=DEFAULT`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt: userMessage.content }),
    });

    // SSEストリーミングを処理
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let isInToolUse = false;
    let toolIdx = -1;

    // ストリームを読み続ける
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // 受信データを行ごとに処理
      for (const line of decoder.decode(value, { stream: true }).split('\n')) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6);
        if (data === '[DONE]') continue;

        const event = JSON.parse(data);

        // ツール使用開始イベント
        if (event.type === 'tool_use') {
          isInToolUse = true;
          const savedBuffer = buffer;
          setMessages(prev => {
            const msgs = [...prev];
            if (savedBuffer) {
              msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], content: savedBuffer };
              toolIdx = msgs.length;
              msgs.push({
                id: crypto.randomUUID(),
                role: 'assistant',
                content: '',
                isToolUsing: true,
                toolName: event.tool_name
              });
            } else {
              toolIdx = msgs.length - 1;
              msgs[msgs.length - 1] = {
                ...msgs[msgs.length - 1],
                isToolUsing: true,
                toolName: event.tool_name
              };
            }
            return msgs;
          });
          buffer = '';
          continue;
        }

        // テキストイベント（AI応答本文）
        if (event.type === 'text' && event.data) {
          if (isInToolUse && !buffer) {
            // ツール実行後の最初のテキスト → ツールを完了状態に
            const savedIdx = toolIdx;
            setMessages(prev => {
              const msgs = [...prev];
              if (savedIdx >= 0 && savedIdx < msgs.length) {
                msgs[savedIdx] = { ...msgs[savedIdx], toolCompleted: true };
              }
              msgs.push({
                id: crypto.randomUUID(),
                role: 'assistant',
                content: event.data
              });
              return msgs;
            });
            buffer = event.data;
            isInToolUse = false;
            toolIdx = -1;
          } else {
            // 通常のテキスト蓄積（ストリーミング表示）
            buffer += event.data;
            setMessages(prev => {
              const msgs = [...prev];
              msgs[msgs.length - 1] = {
                ...msgs[msgs.length - 1],
                content: buffer,
                isToolUsing: false
              };
              return msgs;
            });
          }
        }
      }
    }
    setLoading(false);
  };

  // スタイル定義
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100vh',
    width: 700,
    margin: '0 auto'
  };
  const messageAreaStyle = { flex: 1, overflow: 'auto', padding: 16 };
  const userBubbleStyle = { background: '#f97316', color: '#fff' };
  const aiBubbleStyle = { background: '#f8f8f8', color: '#333', border: '1px solid #ddd' };
  const bubbleBase = { maxWidth: '80%', padding: 12, borderRadius: 8 };
  const formStyle = { display: 'flex', gap: 8, padding: 16, width: 700, boxSizing: 'border-box' as const };
  const inputStyle = { flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd' };
  const buttonStyle = { padding: '8px 24px', borderRadius: 8, background: '#f97316', color: '#fff', border: 'none', cursor: 'pointer' };

  return (
    <div style={containerStyle}>
      {/* メッセージ表示エリア */}
      <div style={messageAreaStyle}>
        {messages.map(msg => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: 8
            }}
          >
            <div style={{ ...bubbleBase, ...(msg.role === 'user' ? userBubbleStyle : aiBubbleStyle) }}>
              {/* 思考中 */}
              {msg.role === 'assistant' && !msg.content && !msg.isToolUsing && (
                <span>思考中...</span>
              )}
              {/* ツール使用中/完了 */}
              {msg.isToolUsing && (
                <span style={{ color: msg.toolCompleted ? 'green' : '#6366f1' }}>
                  {msg.toolCompleted ? '✓' : '⏳'} {msg.toolName}
                  {msg.toolCompleted ? 'を利用しました' : 'を利用中...'}
                </span>
              )}
              {/* メッセージ本文（マークダウン対応） */}
              {msg.content && !msg.isToolUsing && (
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 入力フォーム */}
      <form onSubmit={handleSubmit} style={formStyle}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="メッセージを入力..."
          disabled={loading}
          style={inputStyle}
        />
        <button type="submit" disabled={loading || !input.trim()} style={buttonStyle}>
          {loading ? '⌛️' : '送信'}
        </button>
      </form>
    </div>
  );
}

export default App;
