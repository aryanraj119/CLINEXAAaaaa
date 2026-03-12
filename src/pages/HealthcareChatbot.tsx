import { FormEvent, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  text: string;
  isStreaming?: boolean;
}

const SYSTEM_PROMPT = `You are MedBot, an expert AI healthcare assistant for Clinexa. Your role is to help patients understand health-related topics clearly and compassionately.

Guidelines:
- Explain medical symptoms, conditions, medications, and treatments in simple, easy-to-understand language.
- Always recommend consulting a qualified doctor for diagnosis or treatment plans.
- Provide evidence-based information on prevention, wellness, nutrition, and lifestyle.
- Be empathetic and supportive — patients may be anxious about their health.
- Never provide a definitive diagnosis. Help users understand possibilities and what to discuss with their doctor.
- For emergencies (chest pain, difficulty breathing, stroke symptoms), always urge the user to call emergency services immediately.
- Keep responses clear, structured with bullet points or numbered lists when appropriate.
- End responses with a reassuring note or next step recommendation.`;

const SUGGESTED_QUESTIONS = [
  "What are symptoms of diabetes?",
  "How do I manage high blood pressure naturally?",
  "What causes frequent headaches?",
  "Explain the difference between a cold and flu",
  "What vitamins should I take daily?",
  "How much sleep do adults need?",
];

const HealthcareChatbot = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<"checking" | "online" | "offline">("checking");
  const [ollamaModel, setOllamaModel] = useState("llama3.2");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Check Ollama connectivity on mount
  useEffect(() => {
    const checkOllama = async () => {
      try {
        const res = await fetch("http://127.0.0.1:11434/api/tags");
        if (res.ok) {
          const data = await res.json();
          const models: string[] = (data.models ?? []).map((m: any) => m.name as string);
          // pick best available model
          const preferred = ["llama3", "llama3.2", "llama3.1", "llama2", "mistral", "gemma"];
          const found = preferred.find((p) => models.some((m) => m.startsWith(p)));
          if (found) setOllamaModel(models.find((m) => m.startsWith(found)) ?? models[0]);
          else if (models.length > 0) setOllamaModel(models[0]);
          setOllamaStatus("online");
        } else {
          setOllamaStatus("offline");
        }
      } catch {
        setOllamaStatus("offline");
      }
    };
    checkOllama();
  }, []);

  const sendQuestion = async (text?: string) => {
    const trimmed = (text ?? question).trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = { id: Date.now(), role: "user", text: trimmed };
    const assistantId = Date.now() + 1;

    setMessages((prev) => [
      ...prev,
      userMsg,
      { id: assistantId, role: "assistant", text: "", isStreaming: true },
    ]);
    setQuestion("");
    setIsLoading(true);

    // Build conversation context
    const recentHistory = messages.slice(-8);
    const conversationContext = recentHistory
      .map((m) => `${m.role === "user" ? "Human" : "Assistant"}: ${m.text}`)
      .join("\n");

    const fullPrompt = conversationContext
      ? `${conversationContext}\nHuman: ${trimmed}\nAssistant:`
      : `Human: ${trimmed}\nAssistant:`;

    try {
      const response = await fetch("http://127.0.0.1:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: ollamaModel,
          prompt: fullPrompt,
          system: SYSTEM_PROMPT,
          stream: true,
          options: {
            temperature: 0.3,
            top_p: 0.9,
            num_predict: 600,
          },
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Ollama error: ${response.status} ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter(Boolean);
        for (const line of lines) {
          try {
            const json = JSON.parse(line);
            if (json.response) {
              accumulated += json.response;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, text: accumulated, isStreaming: !json.done } : m
                )
              );
            }
          } catch {}
        }
      }

      // Finalize
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, isStreaming: false } : m
        )
      );
    } catch (error) {
      const errText =
        ollamaStatus === "offline"
          ? "⚠️ Ollama is not running. Please start Ollama with `ollama serve` in your terminal, then refresh this page. Make sure your model is pulled (e.g., `ollama pull llama3`)."
          : `⚠️ Could not get a response: ${(error as Error).message}. Check that Ollama is running and the model is available.`;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, text: errText, isStreaming: false } : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendQuestion();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendQuestion();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setQuestion("");
  };

  return (
    <div className="hc-root">
      {/* ── NAV ── */}
      <nav className="hc-nav">
        <div className="hc-nav-inner">
          <Link to="/" className="hc-logo">
            <span className="hc-logo-icon">🏥</span>
            <span>Clinexa <span className="hc-logo-accent">MedBot</span></span>
          </Link>
          <div className="hc-nav-right">
            <div className={`hc-status-pill ${ollamaStatus}`}>
              <span className="hc-status-dot" />
              {ollamaStatus === "checking"
                ? "Checking…"
                : ollamaStatus === "online"
                ? `AI Online · ${ollamaModel}`
                : "AI Offline"}
            </div>
            <Button variant="ghost" size="sm" asChild className="hc-back-btn">
              <Link to="/">← Back</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* ── MAIN LAYOUT ── */}
      <div className="hc-layout">
        {/* ── SIDEBAR ── */}
        <aside className="hc-sidebar">
          <div className="hc-sidebar-header">
            <div className="hc-avatar-lg">🤖</div>
            <h2>MedBot</h2>
            <p>Your AI Healthcare Assistant</p>
          </div>

          <div className="hc-sidebar-section">
            <h3>💡 Try asking</h3>
            <ul className="hc-suggestions">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <li key={i}>
                  <button
                    className="hc-suggestion-btn"
                    onClick={() => sendQuestion(q)}
                    disabled={isLoading}
                  >
                    {q}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="hc-disclaimer">
            <span>⚕️</span>
            <p>For informational purposes only. Always consult a licensed physician for medical advice.</p>
          </div>
        </aside>

        {/* ── CHAT PANEL ── */}
        <main className="hc-chat-panel">
          {/* Empty state */}
          {messages.length === 0 && (
            <div className="hc-empty-state">
              <div className="hc-empty-icon">🩺</div>
              <h2>How can I help you today?</h2>
              <p>Ask me anything about symptoms, medications, health tips, or general medical knowledge.</p>
              <div className="hc-quick-picks">
                {SUGGESTED_QUESTIONS.slice(0, 3).map((q, i) => (
                  <button
                    key={i}
                    className="hc-quick-pick"
                    onClick={() => sendQuestion(q)}
                    disabled={isLoading}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="hc-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`hc-msg-row ${msg.role}`}>
                {msg.role === "assistant" && (
                  <div className="hc-avatar-sm">🤖</div>
                )}
                <div className={`hc-bubble ${msg.role}`}>
                  <div className="hc-bubble-text">
                    {msg.text || (msg.isStreaming ? "" : "")}
                    {msg.isStreaming && <span className="hc-cursor" />}
                  </div>
                </div>
                {msg.role === "user" && (
                  <div className="hc-avatar-sm user">👤</div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="hc-input-area">
            <form onSubmit={onSubmit} className="hc-form">
              <div className="hc-textarea-wrapper">
                <textarea
                  ref={textareaRef}
                  className="hc-textarea"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe your symptom or ask a health question… (Enter to send)"
                  disabled={isLoading}
                  rows={2}
                />
                <button
                  type="submit"
                  className="hc-send-btn"
                  disabled={isLoading || !question.trim()}
                  aria-label="Send"
                >
                  {isLoading ? (
                    <span className="hc-spinner" />
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="hc-form-footer">
                <span className="hc-hint">Shift+Enter for new line · Enter to send</span>
                {messages.length > 0 && (
                  <button type="button" className="hc-clear-btn" onClick={clearChat}>
                    Clear chat
                  </button>
                )}
              </div>
            </form>
          </div>
        </main>
      </div>

      {/* ── EMBEDDED STYLES ── */}
      <style>{`
        /* ===== ROOT & LAYOUT ===== */
        .hc-root {
          min-height: 100vh;
          background: linear-gradient(135deg, #050d1a 0%, #0a1628 40%, #061520 100%);
          color: #e2eaf5;
          font-family: 'Inter', system-ui, sans-serif;
          display: flex;
          flex-direction: column;
        }

        /* ===== NAV ===== */
        .hc-nav {
          border-bottom: 1px solid rgba(0,180,216,0.18);
          background: rgba(5,13,26,0.85);
          backdrop-filter: blur(18px);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .hc-nav-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 14px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .hc-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 1.25rem;
          font-weight: 700;
          color: #e2eaf5;
          text-decoration: none;
          letter-spacing: -0.5px;
        }
        .hc-logo-icon { font-size: 1.5rem; }
        .hc-logo-accent { color: #00b4d8; }
        .hc-nav-right { display: flex; align-items: center; gap: 14px; }

        /* Status pill */
        .hc-status-pill {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 5px 13px;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 600;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.06);
          letter-spacing: 0.3px;
        }
        .hc-status-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #888;
          flex-shrink: 0;
        }
        .hc-status-pill.online .hc-status-dot { background: #22c55e; box-shadow: 0 0 8px #22c55e; }
        .hc-status-pill.offline .hc-status-dot { background: #ef4444; box-shadow: 0 0 8px #ef4444; }
        .hc-status-pill.checking .hc-status-dot { background: #f59e0b; animation: pulse 1s infinite; }
        .hc-back-btn { color: #94b8d4 !important; }

        /* ===== LAYOUT ===== */
        .hc-layout {
          flex: 1;
          display: flex;
          max-width: 1400px;
          width: 100%;
          margin: 0 auto;
          padding: 24px 20px;
          gap: 20px;
        }

        /* ===== SIDEBAR ===== */
        .hc-sidebar {
          width: 280px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .hc-sidebar-header {
          background: linear-gradient(135deg, rgba(0,180,216,0.15), rgba(0,100,160,0.1));
          border: 1px solid rgba(0,180,216,0.25);
          border-radius: 16px;
          padding: 24px 20px;
          text-align: center;
        }
        .hc-avatar-lg {
          width: 64px; height: 64px;
          margin: 0 auto 12px;
          background: linear-gradient(135deg, #00b4d8, #0077b6);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          box-shadow: 0 8px 24px rgba(0,180,216,0.35);
        }
        .hc-sidebar-header h2 {
          font-size: 1rem;
          font-weight: 700;
          color: #cce8f4;
          margin: 0 0 4px;
        }
        .hc-sidebar-header p {
          font-size: 0.75rem;
          color: #7aabcc;
          margin: 0;
        }
        .hc-sidebar-section {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 16px;
        }
        .hc-sidebar-section h3 {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: #6b98b8;
          margin: 0 0 12px;
        }
        .hc-suggestions { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
        .hc-suggestion-btn {
          width: 100%;
          text-align: left;
          padding: 8px 12px;
          background: rgba(0,180,216,0.07);
          border: 1px solid rgba(0,180,216,0.15);
          border-radius: 8px;
          color: #a8ccdf;
          font-size: 0.78rem;
          cursor: pointer;
          transition: all 0.2s;
          line-height: 1.4;
        }
        .hc-suggestion-btn:hover:not(:disabled) {
          background: rgba(0,180,216,0.18);
          border-color: rgba(0,180,216,0.45);
          color: #cce8f4;
          transform: translateX(3px);
        }
        .hc-suggestion-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        .hc-disclaimer {
          display: flex;
          gap: 8px;
          align-items: flex-start;
          font-size: 0.7rem;
          color: #5a7a90;
          line-height: 1.5;
          padding: 12px;
          background: rgba(239,68,68,0.06);
          border: 1px solid rgba(239,68,68,0.15);
          border-radius: 10px;
        }

        /* ===== CHAT PANEL ===== */
        .hc-chat-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          overflow: hidden;
          min-height: 0;
        }

        /* Empty state */
        .hc-empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 48px 24px;
          gap: 12px;
        }
        .hc-empty-icon { font-size: 4rem; animation: float 3s ease-in-out infinite; }
        .hc-empty-state h2 {
          font-size: 1.6rem;
          font-weight: 700;
          color: #cce8f4;
          margin: 0;
        }
        .hc-empty-state p {
          color: #6b98b8;
          max-width: 380px;
          line-height: 1.6;
          margin: 0;
          font-size: 0.9rem;
        }
        .hc-quick-picks {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
          margin-top: 8px;
        }
        .hc-quick-pick {
          padding: 8px 16px;
          border-radius: 999px;
          border: 1px solid rgba(0,180,216,0.3);
          background: rgba(0,180,216,0.08);
          color: #7dc8e0;
          font-size: 0.82rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .hc-quick-pick:hover:not(:disabled) {
          background: rgba(0,180,216,0.22);
          color: #cce8f4;
          border-color: rgba(0,180,216,0.6);
        }
        .hc-quick-pick:disabled { opacity: 0.4; cursor: not-allowed; }

        /* Messages scroll area */
        .hc-messages {
          flex: 1;
          overflow-y: auto;
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          scroll-behavior: smooth;
        }
        .hc-messages::-webkit-scrollbar { width: 5px; }
        .hc-messages::-webkit-scrollbar-track { background: transparent; }
        .hc-messages::-webkit-scrollbar-thumb { background: rgba(0,180,216,0.2); border-radius: 999px; }

        /* Msg rows */
        .hc-msg-row {
          display: flex;
          gap: 10px;
          align-items: flex-end;
        }
        .hc-msg-row.user { flex-direction: row-reverse; }

        /* Avatars */
        .hc-avatar-sm {
          width: 34px; height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          flex-shrink: 0;
          background: linear-gradient(135deg, #00b4d8, #0077b6);
          box-shadow: 0 4px 12px rgba(0,180,216,0.3);
        }
        .hc-avatar-sm.user {
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          box-shadow: 0 4px 12px rgba(124,58,237,0.3);
        }

        /* Bubbles */
        .hc-bubble {
          max-width: 72%;
          padding: 12px 16px;
          border-radius: 18px;
          line-height: 1.65;
          font-size: 0.9rem;
          word-break: break-word;
          white-space: pre-wrap;
        }
        .hc-bubble.assistant {
          background: rgba(0,180,216,0.1);
          border: 1px solid rgba(0,180,216,0.22);
          border-bottom-left-radius: 6px;
          color: #cce8f4;
        }
        .hc-bubble.user {
          background: linear-gradient(135deg, rgba(124,58,237,0.3), rgba(79,70,229,0.25));
          border: 1px solid rgba(124,58,237,0.3);
          border-bottom-right-radius: 6px;
          color: #e2d9ff;
        }
        .hc-bubble-text { position: relative; }

        /* Streaming cursor */
        .hc-cursor {
          display: inline-block;
          width: 2px; height: 1.1em;
          background: #00b4d8;
          margin-left: 3px;
          vertical-align: text-bottom;
          animation: blink 0.9s step-end infinite;
          border-radius: 1px;
        }

        /* ===== INPUT AREA ===== */
        .hc-input-area {
          border-top: 1px solid rgba(255,255,255,0.07);
          padding: 16px 20px;
          background: rgba(0,0,0,0.2);
        }
        .hc-form { display: flex; flex-direction: column; gap: 8px; }
        .hc-textarea-wrapper {
          display: flex;
          gap: 10px;
          align-items: flex-end;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(0,180,216,0.25);
          border-radius: 14px;
          padding: 10px 10px 10px 16px;
          transition: border-color 0.2s;
        }
        .hc-textarea-wrapper:focus-within {
          border-color: rgba(0,180,216,0.6);
          box-shadow: 0 0 0 3px rgba(0,180,216,0.08);
        }
        .hc-textarea {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #e2eaf5;
          font-size: 0.9rem;
          line-height: 1.6;
          resize: none;
          font-family: inherit;
          max-height: 140px;
          overflow-y: auto;
        }
        .hc-textarea::placeholder { color: #4a6a80; }
        .hc-send-btn {
          width: 42px; height: 42px;
          border-radius: 10px;
          background: linear-gradient(135deg, #00b4d8, #0077b6);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s;
          color: #fff;
        }
        .hc-send-btn svg { width: 18px; height: 18px; }
        .hc-send-btn:hover:not(:disabled) {
          transform: scale(1.06);
          box-shadow: 0 6px 18px rgba(0,180,216,0.45);
        }
        .hc-send-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: none;
        }
        .hc-form-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 4px;
        }
        .hc-hint { font-size: 0.7rem; color: #3a5a70; }
        .hc-clear-btn {
          font-size: 0.72rem;
          color: #5a8aaa;
          background: none;
          border: none;
          cursor: pointer;
          padding: 2px 8px;
          border-radius: 6px;
          transition: color 0.15s;
        }
        .hc-clear-btn:hover { color: #ef4444; }

        /* Spinner */
        .hc-spinner {
          display: inline-block;
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        /* ===== ANIMATIONS ===== */
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes blink { 50% { opacity: 0; } }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 768px) {
          .hc-layout { flex-direction: column; padding: 12px; }
          .hc-sidebar { width: 100%; }
          .hc-suggestions { display: none; }
          .hc-chat-panel { min-height: 60vh; }
          .hc-bubble { max-width: 90%; }
        }
      `}</style>
    </div>
  );
};

export default HealthcareChatbot;
