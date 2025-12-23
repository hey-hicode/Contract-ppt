"use client";
import * as React from "react";
import { Send } from "lucide-react";

type Message = { id: string; role: "user" | "assistant"; content: string };

export function GeneralChat() {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
<<<<<<< HEAD
  const [threadId, setThreadId] = React.useState<string | null>(null);
  const [saveChat, setSaveChat] = React.useState(true); // default: save
=======
  const listRef = React.useRef<HTMLDivElement | null>(null);

  // Sidebar data
  const questionsAsked = React.useMemo(
    () => messages.filter((m) => m.role === "user").length,
    [messages]
  );
  const suggestedQuestions = [
    "What should I look for in a freelance contract?",
    "Explain indemnification clauses",
    "What's a reasonable non-compete period?",
    "How do I negotiate payment terms?",
    "What are the risks of unlimited liability?",
    "Explain intellectual property rights",
  ];
>>>>>>> 0325e8eed8497c2a610164125b0422463d7e3d00

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat/general", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, threadId, saveChat }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      if (data.threadId && !threadId) setThreadId(data.threadId);

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const ThinkingDots = () => (
    <div className="flex justify-start">
      <div className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2">
        <span className="text-xs text-slate-600">Thinking</span>
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: "0s" }}></span>
          <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: ".15s" }}></span>
          <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: ".3s" }}></span>
        </div>
      </div>
    </div>
  );

  const AnimatedBubble = ({ role, children }: { role: "user" | "assistant"; children: React.ReactNode }) => {
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => {
      const t = setTimeout(() => setMounted(true), 10);
      return () => clearTimeout(t);
    }, []);
    return (
      <div className={`flex ${role === "user" ? "justify-end" : "justify-start"}`}>
        <div
          className={`max-w-[85%] rounded-lg px-3 py-2 text-sm transition-all duration-300 ease-out ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
          } ${role === "user" ? "bg-primary text-white" : "bg-slate-100 text-slate-800"}`}
        >
          {children}
        </div>
      </div>
    );
  };

  React.useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, loading]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
      {/* Chat column */}
      <div className="rounded-xl h-fit border bg-white">
        {/* Header */}
        <div className="border-b p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 grid place-items-center rounded-full bg-primary/10 text-primary">
              <span className="text-sm font-bold">AI</span>
            </div>
            <div>
              <h2 className="text-base font-semibold">Contract Counselr</h2>
              {/* <p className="text-sm text-slate-500">Powered by advanced AI</p> */}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div ref={listRef} className="h-[500px] overflow-y-auto px-4 py-3 space-y-3">
          {/* Starter assistant message */}
          {messages.length === 0 && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-lg bg-slate-100 px-3 py-2 text-slate-700">
                Hello! I&apos;m your Counselr contract assistant. I can help you understand contract terms, identify risks, and answer questions about legal concepts. How can I help you today?
              </div>
            </div>
          )}

          {messages.map((m) => (
            <AnimatedBubble key={m.id} role={m.role}>{m.content}</AnimatedBubble>
          ))}

          {loading && <ThinkingDots />}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="border-t p-3">
          <div className="flex gap-2">
            <input
              className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about contracts..."
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className="h-9 w-9 grid place-items-center rounded-lg bg-primary text-white disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>

<<<<<<< HEAD
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about contracts…"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground disabled:opacity-50"
        >
          Send
        </button>
      </form>

      <label className="text-xs mt-1 flex items-center gap-2">
        <input
          type="checkbox"
          checked={saveChat}
          onChange={() => setSaveChat(!saveChat)}
        />
        Save chat
      </label>
=======
      {/* Sidebar column */}
      <aside className="space-y-4">
        {/* Suggested Questions */}
        <div className="rounded-xl border bg-white">
          <div className=" p-4">
            <h3 className="text-sm font-semibold">Suggested Questions</h3>
          </div>
          <div className="p-3 space-y-2">
            {suggestedQuestions.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setInput(q)}
                className="w-full text-left rounded-md border px-3 py-2 text-sm hover:bg-primary/20 cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Your Activity */}
        <div className="rounded-xl border text-white bg-primary">
          <div className=" p-4">
            <h3 className="text-sm font-semibold">Your Activity</h3>
          </div>
          <div className="p-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-white">Questions Asked</span>
              <span className="font-semibold">{questionsAsked}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white">Contracts Discussed</span>
              <span className="font-semibold">–</span>
            </div>
            <div>
              <div className="text-white mb-3">Topics Explored</div>
              <div className="flex flex-wrap gap-2">
                {[
                  "Termination",
                  "Payment",
                  "IP Rights",
                ].map((t) => (
                  <span key={t} className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pro Tips */}
        <div className="rounded-xl border bg-white">
          <div className=" p-4">
            <h3 className="text-sm font-semibold">Pro Tips</h3>
          </div>
          <div className="p-4 text-sm text-slate-700 space-y-2">
            <p>• Be specific with your questions</p>
            <p>• Reference specific contract clauses</p>
            <p>• Ask for examples when needed</p>
            <p>• Request negotiation strategies</p>
          </div>
        </div>
      </aside>
>>>>>>> 0325e8eed8497c2a610164125b0422463d7e3d00
    </div>
  );
}
