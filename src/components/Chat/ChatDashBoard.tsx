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
} from "lucide-react";

type Thread = { id: string; title: string; created_at: string };
type Message = {
  role: "user" | "assistant";
  content: string;
  created_at?: string;
};

export default function ChatDashboard() {
  const [newChatMessages, setNewChatMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [threadId, setThreadId] = React.useState<string | null>(null);
  const [threads, setThreads] = React.useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = React.useState<string | null>(
    null
  );
  const [savedMessages, setSavedMessages] = React.useState<Message[]>([]);
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
  }, [newChatMessages, savedMessages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage: Message = { role: "user", content: text };
    setNewChatMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat/general", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, threadId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      if (data.threadId && !threadId) setThreadId(data.threadId);

      const assistantMessage: Message = {
        role: "assistant",
        content: data.reply,
      };
      setNewChatMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      setNewChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSaveChat = async () => {
    if (!newChatMessages.length) return;
    setSaving(true);
    try {
      const res = await fetch("/api/chat/save-thread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId,
          messages: newChatMessages,
          title: titleInput,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save chat");

      setThreadId(data.threadId);
      setThreads((prev) => [
        {
          id: data.threadId,
          title: titleInput,
          created_at: new Date().toISOString(),
        },
        ...prev.filter((t) => t.id !== data.threadId),
      ]);
      setEditingTitle(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save chat.");
    } finally {
      setSaving(false);
    }
  };

  const handleNewChat = () => {
    setSelectedThread(null);
    setThreadId(null);
    setNewChatMessages([]);
    setTitleInput("New Chat");
    setEditingTitle(false);
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

  const currentMessages = selectedThread ? savedMessages : newChatMessages;
  const hasMessages = currentMessages.length > 0;

  return (
    <div className="flex h-[80vh] bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col shadow-sm">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-200">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
          >
            <Plus size={20} />
            New Chat
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Thread List */}
        <div className="flex-1 overflow-y-auto p-2">
          {filteredThreads.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <MessageSquare size={48} className="text-slate-300 mb-3" />
              <p className="text-sm text-slate-400">
                {searchQuery
                  ? "No conversations found"
                  : "No saved conversations yet"}
              </p>
            </div>
          )}
          {filteredThreads.map((t) => (
            <div
              key={t.id}
              onClick={() => {
                setSelectedThread(t.id);
                setThreadId(null);
                setNewChatMessages([]);
              }}
              className={`group cursor-pointer p-3 mb-2 rounded-lg transition-all ${
                selectedThread === t.id
                  ? "bg-blue-50 border border-blue-200"
                  : "hover:bg-slate-50 border border-transparent"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-slate-900 truncate">
                    {t.title}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {new Date(t.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </div>
                <button
                  onClick={(e) => handleDeleteThread(t.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-all"
                >
                  <Trash2 size={14} className="text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              {!selectedThread && editingTitle ? (
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  onBlur={() => setEditingTitle(false)}
                  onKeyDown={(e) => e.key === "Enter" && setEditingTitle(false)}
                  className="text-xl font-semibold text-slate-900 border-b-2 border-blue-500 outline-none bg-transparent"
                  autoFocus
                />
              ) : (
                <h1 className="text-xl font-semibold text-slate-900">
                  {selectedThread
                    ? threads.find((t) => t.id === selectedThread)?.title
                    : titleInput}
                </h1>
              )}
              {!selectedThread && !editingTitle && (
                <button
                  onClick={() => setEditingTitle(true)}
                  className="p-1 hover:bg-slate-100 rounded transition-colors"
                >
                  <Edit2 size={16} className="text-slate-400" />
                </button>
              )}
            </div>
            {!selectedThread && hasMessages && (
              <button
                onClick={handleSaveChat}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg text-sm font-medium hover:from-emerald-700 hover:to-green-700 transition-all disabled:opacity-50 shadow-md hover:shadow-lg"
              >
                <Save size={16} />
                {saving ? "Saving..." : "Save Chat"}
              </button>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {!hasMessages ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-100 rounded-2xl flex items-center justify-center mb-4">
                <MessageSquare size={32} className="text-blue-600" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">
                Start a conversation
              </h2>
              <p className="text-slate-500 max-w-md">
                Ask anything about contracts, legal documents, or general
                questions.
              </p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-4">
              {currentMessages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] px-5 py-3 rounded-2xl shadow-sm ${
                      m.role === "user"
                        ? "bg-gradient-to-r from-blue-600 to-blue-600 text-white"
                        : "bg-white text-slate-800 border border-slate-200"
                    }`}
                  >
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                      {m.content}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 px-5 py-3 rounded-2xl shadow-sm">
                    <div className="flex gap-1">
                      <div
                        className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <div
                        className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <div
                        className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
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
          <div className="bg-white border-t border-slate-200 px-6 py-4 shadow-lg">
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-3 items-end">
                <div className="flex-1 relative">
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
                    placeholder="Ask anything about contracts..."
                    rows={1}
                    className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    style={{ minHeight: "48px", maxHeight: "120px" }}
                  />
                </div>
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-medium"
                >
                  <Send size={18} />
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
