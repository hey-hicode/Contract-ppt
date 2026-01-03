"use client";
import * as React from "react";
import {
  Search,
  Plus,
  MessageSquare,
  Trash2,
  Edit2,
  Send,
  Save,
  Clock,
  User,
  Bot,
} from "lucide-react";

type Thread = { id: string; title: string; created_at: string };
type Message = {
  role: "user" | "assistant";
  content: string;
  created_at?: string;
};

export default function ChatDashboard() {
  const [draftMessages, setDraftMessages] = React.useState<Message[]>([]);
  const [savedMessages, setSavedMessages] = React.useState<Message[]>([]);
  const [selectedThread, setSelectedThread] = React.useState<string | null>(
    null
  );

  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [threads, setThreads] = React.useState<Thread[]>([]);

  const [saving, setSaving] = React.useState(false);
  const [titleInput, setTitleInput] = React.useState("Contract Chat");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [editingTitle, setEditingTitle] = React.useState(false);

  const chatEndRef = React.useRef<HTMLDivElement | null>(null);
  const inputRef = React.useRef<HTMLTextAreaElement | null>(null);

  React.useEffect(() => {
    fetch("/api/chat/threads")
      .then((res) => res.json())
      .then((data) => setThreads(data.threads || []))
      .catch((err) => console.error(err));
  }, []);

  React.useEffect(() => {
    if (!selectedThread) return;
    fetch(`/api/chat/threads/${selectedThread}`)
      .then((res) => res.json())
      .then((data) => setSavedMessages(data.messages || []))
      .catch((err) => console.error(err));
  }, [selectedThread]);

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [draftMessages, savedMessages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setLoading(true);
    setInput("");

    try {
      const res = await fetch("/api/chat/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: draftMessages,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      setDraftMessages((prev) => [
        ...prev,
        { role: "user", content: text },
        { role: "assistant", content: data.reply },
      ]);
    } catch {
      setDraftMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong.",
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSaveChat = async () => {
    if (!draftMessages.length) return;

    setSaving(true);
    try {
      const res = await fetch("/api/chat/save-thread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: draftMessages }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setDraftMessages([]);
      setSelectedThread(data.threadId);

      // refresh threads
      const threadsRes = await fetch("/api/chat/threads");
      const threadsData = await threadsRes.json();
      setThreads(threadsData.threads || []);
    } finally {
      setSaving(false);
    }
  };

  const handleNewChat = () => {
    setSelectedThread(null);
    setDraftMessages([]);
    setSavedMessages([]);
    inputRef.current?.focus();
  };

  const handleDeleteThread = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this conversation?")) return;

    try {
      await fetch(`/api/chat/threads/${id}`, { method: "DELETE" });
      setThreads((prev) => prev.filter((t) => t.id !== id));
      if (selectedThread === id) {
        handleNewChat();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredThreads = threads.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentMessages = selectedThread ? savedMessages : draftMessages;
  const hasMessages = currentMessages.length > 0;

  return (
    <div className="flex h-[85vh] bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-none">
      {/* Sidebar */}
      <div className="w-80 bg-slate-50/50 border-r border-slate-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-6">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/80 transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
          >
            <Plus size={18} strokeWidth={2.5} />
            New Conversation
          </button>
        </div>

        {/* Search */}
        <div className="px-6 pb-4">
          <div className="relative group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
              size={16}
            />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Thread List */}
        <div className="flex-1 overflow-y-auto px-3 pb-4">
          <div className="px-3 mb-2">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Recent Chats
            </h2>
          </div>
          {filteredThreads.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                <MessageSquare size={20} className="text-slate-400" />
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {searchQuery ? "No matches found" : "Start your first chat"}
              </p>
            </div>
          )}
          {filteredThreads.map((t) => (
            <div
              key={t.id}
              onClick={() => {
                setSelectedThread(t.id);
                setDraftMessages([]);
              }}
              className={`group relative cursor-pointer p-3 mb-1 rounded-xl transition-all ${
                selectedThread === t.id
                  ? "bg-white shadow-sm border border-slate-200"
                  : "hover:bg-slate-100/80 border border-transparent"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-1 p-1.5 rounded-lg ${
                    selectedThread === t.id
                      ? "bg-blue-50 text-blue-600"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  <MessageSquare size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={`font-semibold text-sm truncate ${
                      selectedThread === t.id
                        ? "text-blue-600"
                        : "text-slate-700"
                    }`}
                  >
                    {t.title}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1 font-medium">
                    <Clock size={10} />
                    {new Date(t.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
                <button
                  onClick={(e) => handleDeleteThread(t.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2
                    size={14}
                    className="text-red-400 hover:text-red-500"
                  />
                </button>
              </div>
              {selectedThread === t.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-full" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Chat Header */}
        <div className="h-[73px] border-b border-slate-200 px-8 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
              <MessageSquare size={20} strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              {!selectedThread && editingTitle ? (
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  onBlur={() => setEditingTitle(false)}
                  onKeyDown={(e) => e.key === "Enter" && setEditingTitle(false)}
                  className="w-full text-lg font-bold text-slate-900 border-b-2 border-blue-500 outline-none bg-transparent"
                  autoFocus
                />
              ) : (
                <div className="flex items-center gap-2 group">
                  <h1 className="text-lg font-bold text-slate-900 truncate">
                    {selectedThread
                      ? threads.find((t) => t.id === selectedThread)?.title
                      : titleInput}
                  </h1>
                  {!selectedThread && (
                    <button
                      onClick={() => setEditingTitle(true)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 rounded-lg transition-all"
                    >
                      <Edit2 size={14} className="text-slate-400" />
                    </button>
                  )}
                </div>
              )}
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-bold uppercase tracking-wider">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                AI Assistant Active
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!selectedThread && hasMessages && (
              <button
                onClick={handleSaveChat}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all disabled:opacity-50 shadow-sm hover:shadow-md active:scale-[0.98]"
              >
                <Save size={16} />
                {saving ? "Saving..." : "Save Conversation"}
              </button>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8">
          {!hasMessages ? (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-2xl mx-auto">
              <h2 className="text-3xl font-semibold text-slate-900 mb-3 tracking-tight">
                How can I help with your contracts today?
              </h2>
              <p className="text-slate-500 text-base mb-10 leading-relaxed">
                Ask me to analyze clauses, identify risks, or summarize complex
                legal terms in plain English.
              </p>

              <div className="grid grid-cols-2 gap-3 w-full">
                {[
                  "Analyze this NDA for risks",
                  "Summarize the termination clause",
                  "What are the payment terms?",
                  "Identify any hidden liabilities",
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => setInput(prompt)}
                    className="py-2 px-4 text-left bg-slate-50 border border-slate-200 rounded-md text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all active:scale-[0.98]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-8">
              {currentMessages.map((m, i) => (
                <div
                  key={i}
                  className={`flex gap-4 ${
                    m.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                      m.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-white border border-slate-200 text-slate-600"
                    }`}
                  >
                    {m.role === "user" ? <User size={20} /> : <Bot size={20} />}
                  </div>
                  <div
                    className={`max-w-[80%] px-6 py-4 rounded-2xl shadow-sm ${
                      m.role === "user"
                        ? "bg-blue-600 text-white rounded-tr-none"
                        : "bg-slate-50 text-slate-800 border border-slate-200 rounded-tl-none"
                    }`}
                  >
                    <div className="text-[15px] leading-relaxed whitespace-pre-wrap font-medium">
                      {m.content}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-4 flex-row">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm text-slate-600">
                    <Bot size={20} />
                  </div>
                  <div className="bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl rounded-tl-none shadow-sm">
                    <div className="flex gap-1.5 items-center h-5">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        {!selectedThread && (
          <div className="bg-white  border-slate-200 ">
            <div className="">
              <div className="relative flex p-2 gap-3 bg-slate-50 border border-slate-200  focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all shadow-none">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask me anything about your contracts..."
                  rows={1}
                  className="flex-1 bg-transparent px-4 py-2 text-[15px] outline-none resize-none  "
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className=" px-6 bg-blue-600 text-white text-sm rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-none"
                >
                  <Send size={18} strokeWidth={2.5} />
                  <span className="text-sm">Send</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
