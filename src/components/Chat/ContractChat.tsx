"use client";

import * as React from "react";
import { Send, FileText, AlertCircle, MessageCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogClose,
  DialogHeader,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "../ui/button";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type Props = {
  analysisId: string;
  documentText?: string;
  contractTitle?: string;
  overallRisk?: string;
  savedId: string | null;
};

export function ContractChat({
  analysisId,
  documentText,
  contractTitle,
  overallRisk,
  savedId,
}: Props) {
  const [threadId, setThreadId] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const chatEndRef = React.useRef<HTMLDivElement | null>(null);
  const inputRef = React.useRef<HTMLTextAreaElement | null>(null);

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setError(null);
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`/api/chat/analyses/${analysisId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          threadId,
          documentText,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get response");

      if (data.threadId && !threadId) setThreadId(data.threadId);

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Something went wrong");
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const getRiskColor = (risk?: string) => {
    if (!risk) return "text-slate-600";
    const lower = risk.toLowerCase();
    if (lower.includes("high")) return "text-red-600";
    if (lower.includes("medium")) return "text-amber-600";
    return "text-emerald-600";
  };

  const suggestedQuestions = [
    "What are the main obligations?",
    "Explain the termination clause",
    "What are the payment terms?",
    "Are there any concerning clauses?",
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="h-14 w-14 rounded-full shadow-2xl bg-black hover:bg-black/90 text-white grid place-items-center transition-transform hover:scale-105"
          aria-label="Chat about this contract"
          disabled={!savedId}
          title={
            !savedId
              ? " Save this analysis first to start chatting with the AI."
              : "Chat"
          }
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col bg-white">
        <DialogHeader>
          <DialogTitle>
            <div className="bg-white border-b border-slate-200 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText size={20} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate">
                    {contractTitle || "Contract Analysis Chat"}
                  </h3>
                  {overallRisk && (
                    <p
                      className={`text-xs font-medium ${getRiskColor(
                        overallRisk
                      )}`}
                    >
                      Risk Level: {overallRisk}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-100 rounded-2xl flex items-center justify-center mb-4">
                <FileText size={24} className="text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-slate-900 mb-2">
                Ask about this contract
              </h4>
              <p className="text-sm text-slate-500 mb-4 max-w-sm">
                Get instant answers about terms, obligations, risks, and more.
              </p>

              {/* Suggested Questions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                {suggestedQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInput(question);
                      inputRef.current?.focus();
                    }}
                    className="px-3 py-2 text-xs text-left bg-white border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-slate-700"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-w-3xl mx-auto">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl shadow-sm ${
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
                  <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div
                          className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        />
                        <div
                          className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        />
                        <div
                          className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        />
                      </div>
                      <span className="text-xs text-slate-600">
                        Analyzing contract...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="px-5 py-2">
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Input Area */}
        <DialogFooter>
          <div className="bg-white border-t border-slate-200 w-full px-5 py-4">
            <div className="w-full flex items-center gap-3">
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
                  placeholder="Ask about this contract..."
                  rows={1}
                  className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder:text-slate-400"
                  style={{ minHeight: "48px", maxHeight: "120px" }}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-medium flex-shrink-0"
              >
                <Send size={18} />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Press Enter to send, Shift + Enter for new line
            </p>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
