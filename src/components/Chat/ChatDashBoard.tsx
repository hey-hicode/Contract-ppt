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
import { motion, AnimatePresence } from "framer-motion";

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
    <div className="flex h-[88vh] bg-white border border-gray-200 rounded-lg overflow-hidden shadow-none relative">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col z-20">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-100/60">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-md font-semibold text-sm hover:opacity-90 transition-all shadow-none"
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>New Chat</span>
          </motion.button>
        </div>

        {/* Search */}
        <div className="p-4 bg-gray-50/30">
          <div className="relative group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors duration-200"
              size={14}
            />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-gray-400 font-normal"
            />
          </div>
        </div>

        {/* Thread List */}
        <div className="flex-1 overflow-y-auto px-2 pb-4 pt-2 custom-scrollbar">
          <div className="px-3 mb-2 flex items-center justify-between">
            <h2 className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
              Recent Activity
            </h2>
          </div>

          <AnimatePresence mode="popLayout">
            {filteredThreads.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-10 px-4 text-center"
              >
                <MessageSquare size={20} className="text-gray-300 mb-2" />
                <p className="text-xs text-gray-400">
                  {searchQuery ? "No matches found" : "No recent chats"}
                </p>
              </motion.div>
            ) : (
              filteredThreads.map((t) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  key={t.id}
                  onClick={() => {
                    setSelectedThread(t.id);
                    setDraftMessages([]);
                  }}
                  className={`group relative flex items-center gap-3 p-3 mb-1 rounded-md cursor-pointer transition-all border ${selectedThread === t.id
                    ? "bg-gray-100/50 border-gray-200"
                    : "bg-transparent border-transparent hover:bg-gray-50"
                    }`}
                >
                  <div className={`p-1.5 rounded-md ${selectedThread === t.id ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400 group-hover:text-gray-500'}`}>
                    <MessageSquare size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className={`font-semibold text-xs truncate ${selectedThread === t.id
                        ? "text-gray-900"
                        : "text-gray-600 group-hover:text-gray-900"
                        }`}
                    >
                      {t.title}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-0.5">
                      <Clock size={10} />
                      {new Date(t.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => handleDeleteThread(t.id, e)}
                    className={`p-1 hover:bg-red-50 rounded-md transition-all ${selectedThread === t.id || "opacity-0 group-hover:opacity-100"}`}
                  >
                    <Trash2 size={14} className="text-red-400 hover:text-red-500" />
                  </motion.button>

                  {selectedThread === t.id && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#F7F9FC]">
        {/* Header */}
        <header className="h-[64px] border-b border-gray-200 px-8 flex items-center justify-between bg-white z-10 shadow-xs">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-9 h-9 bg-gray-50 border border-gray-200 rounded-md flex items-center justify-center text-primary shrink-0">
              <Bot size={18} strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              {!selectedThread && editingTitle ? (
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  onBlur={() => setEditingTitle(false)}
                  onKeyDown={(e) => e.key === "Enter" && setEditingTitle(false)}
                  className="w-full text-base font-bold text-gray-900 border-b border-primary outline-none bg-transparent"
                  autoFocus
                />
              ) : (
                <div className="flex items-center gap-2 group">
                  <h1 className="text-base font-bold text-gray-900 truncate">
                    {selectedThread
                      ? threads.find((t) => t.id === selectedThread)?.title
                      : titleInput}
                  </h1>
                  {!selectedThread && (
                    <button
                      onClick={() => setEditingTitle(true)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded-md transition-all"
                    >
                      <Edit2 size={12} className="text-gray-400" />
                    </button>
                  )}
                </div>
              )}
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-600 uppercase tracking-widest">
                <span className="flex h-1.5 w-1.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                Active Analyst
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!selectedThread && hasMessages && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveChat}
                disabled={saving}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-md text-xs font-semibold transition-all disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                <span>Save Analysis</span>
              </motion.button>
            )}
            <div className="h-4 w-px bg-gray-200 mx-1" />
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-gray-400 font-medium">Model</span>
              <span className="text-xs text-gray-700 font-bold">Counselr v2.0</span>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
          <div className="max-w-4xl mx-auto">
            {!hasMessages ? (
              <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                <div className="w-16 h-16 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-primary mb-6 shadow-xs">
                  <Bot size={32} strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Legal Analysis Assistant
                </h2>
                <p className="text-gray-500 text-sm mb-10 max-w-sm mx-auto leading-relaxed">
                  Ask me to review specific clauses, identify liabilities, or summarize key terms from your contracts.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
                  {[
                    "Spot risks in this NDA",
                    "Summarize termination rights",
                    "Explain payment obligations",
                    "Check for non-compete issues",
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => setInput(prompt)}
                      className="group flex items-center gap-3 p-3.5 bg-white border border-gray-200 rounded-lg text-left hover:border-primary/50 hover:bg-primary/5 transition-all text-xs font-semibold text-gray-700 hover:text-primary"
                    >
                      <MessageSquare size={14} className="text-gray-400 group-hover:text-primary" />
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {currentMessages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-4 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 border ${m.role === "user"
                      ? "bg-primary text-white border-primary shadow-sm"
                      : "bg-white text-primary border-gray-200 shadow-xs"
                      }`}>
                      {m.role === "user" ? <User size={18} strokeWidth={2.5} /> : <Bot size={18} strokeWidth={2.5} />}
                    </div>

                    <div className={`max-w-[80%] space-y-1.5 ${m.role === "user" ? "items-end" : "items-start"}`}>
                      <div
                        className={`px-5 py-3 rounded-lg text-sm leading-relaxed font-medium transition-all ${m.role === "user"
                          ? "bg-primary text-white shadow-sm"
                          : "bg-white text-gray-800 border border-gray-200 shadow-xs"
                          }`}
                      >
                        <div className="whitespace-pre-wrap">{m.content}</div>
                      </div>
                      <div className={`flex items-center gap-1.5 px-1 text-[9px] font-bold uppercase tracking-widest text-gray-400 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                        {m.role === "user" ? "Client" : "Assistant"}
                        <span>•</span>
                        <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {loading && (
                  <div className="flex gap-4">
                    <div className="w-9 h-9 rounded-md bg-white border border-gray-200 flex items-center justify-center shrink-0 text-primary shadow-xs">
                      <Bot size={18} strokeWidth={2.5} />
                    </div>
                    <div className="bg-white border border-gray-200 px-5 py-3 rounded-lg shadow-xs">
                      <div className="flex gap-1">
                        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        {!selectedThread && (
          <div className="px-8 pb-6 bg-transparent">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-end gap-3 p-2 bg-white border border-gray-200 rounded-lg shadow-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Review this contract for any hidden liabilities..."
                  rows={1}
                  className="flex-1 bg-transparent px-3 py-2 text-sm font-medium outline-none resize-none max-h-[200px] text-gray-800 placeholder:text-gray-400"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="h-9 px-4 bg-primary text-white rounded-md flex items-center justify-center shrink-0 hover:bg-primary/90 transition-all disabled:opacity-50 text-xs font-bold"
                >
                  <Send size={14} className="mr-2" strokeWidth={3} />
                  Send
                </motion.button>
              </div>
              <p className="mt-2 text-center text-[9px] font-bold uppercase tracking-widest text-gray-400">
                AI can make mistakes. Please verify important analytical results.
              </p>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E2E8F0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #CBD5E1;
        }
      `}</style>
    </div>
  );
}
