import { useState, useRef, useEffect } from 'react';
import { useDreamStore } from '../dreamStore';
import { Send, Sparkles } from 'lucide-react';
import api from '../api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface RecordPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export default function RecordPage({ onNavigate }: RecordPageProps) {
  const { isAnalyzing, analyzeNewDream } = useDreamStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Welcome to the D-NET Dream Guide interface. Tell me about what you saw in your sleep last night. I will help you extract the key themes, symbols, and emotions before we catalog it in the collective universe.",
    },
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  // Aggregate user dream text from chat logs to use as final submission
  const getFullDreamText = () => {
    return messages
      .filter((m) => m.role === 'user')
      .map((m) => m.content)
      .join('\n\n');
  };

  const fullDreamText = getFullDreamText();
  const wordCount = fullDreamText.trim() ? fullDreamText.trim().split(/\s+/).length : 0;
  const canAnalyze = wordCount >= 10;

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isSending) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsSending(true);

    try {
      const chatHistory = [...messages, userMessage];
      const res = await api.post('/api/chat', { messages: chatHistory });
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.response }]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Connection lost. I am still here to listen, please write details of your dream.' },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleAnalyze = async () => {
    if (!canAnalyze) return;
    const result = await analyzeNewDream(fullDreamText);
    if (result) {
      onNavigate('dream-detail', { dreamId: result.dream_id });
    }
  };

  if (isAnalyzing) {
    return (
      <div className="loader-screen">
        <div className="spinner" />
        <div className="loader-text">Entering the universe...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: isMobile ? 'calc(100vh - 150px)' : 'calc(100vh - 64px)', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
        <div>
          <h1>Dream Guide Chat</h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Speak with the D-NET Guide to map your subconscious</p>
        </div>
        <button
          className="btn btn-primary"
          style={{ padding: '8px 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
          disabled={!canAnalyze}
          onClick={handleAnalyze}
        >
          <Sparkles size={16} />
          Analyze Dream
        </button>
      </div>

      {/* Word Count Indicator */}
      <div style={{ padding: '0 8px 12px', fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', display: 'flex', justifyContent: 'space-between' }}>
        <span>Accumulated dream detail: {wordCount} words</span>
        {!canAnalyze && <span>Describe at least 10 words to enable analysis</span>}
      </div>

      {/* Chat Window */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 8px',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--bg-elevated)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        marginBottom: 16
      }}>
        {messages.map((m, idx) => (
          <div
            key={idx}
            style={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: m.role === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--text-3)',
              textTransform: 'uppercase',
              marginBottom: 4,
              letterSpacing: 0.5
            }}>
              {m.role === 'user' ? 'You' : 'Dream Guide'}
            </div>
            <div style={{
              background: m.role === 'user' ? 'var(--primary-dim)' : 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              fontSize: 14,
              color: m.role === 'user' ? 'var(--text-1)' : 'var(--text-2)',
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap'
            }}>
              {m.content}
            </div>
          </div>
        ))}

        {isSending && (
          <div style={{ alignSelf: 'flex-start', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase' }}>
              Dream Guide
            </div>
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}>
              <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
              <span style={{ fontSize: 13, color: 'var(--text-3)' }}>Tuning to frequency...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          type="text"
          className="input-field"
          style={{ flex: 1, background: 'var(--surface)' }}
          placeholder="Answer the guide or describe your dream details..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isSending}
        />
        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: 48, height: 48, padding: 0 }}
          disabled={!input.trim() || isSending}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
