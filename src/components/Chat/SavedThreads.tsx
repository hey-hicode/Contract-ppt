"use client";
import * as React from "react";

type Thread = { id: string; title: string; created_at: string };
type Message = {
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

export function SavedThreads() {
  const [threads, setThreads] = React.useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = React.useState<string | null>(
    null
  );
  const [messages, setMessages] = React.useState<Message[]>([]);

  React.useEffect(() => {
    fetch("/api/chat/threads")
      .then((res) => res.json())
      .then((data) => setThreads(data.threads || []));
  }, []);

  React.useEffect(() => {
    if (!selectedThread) return;
    fetch(`/api/chat/threads/${selectedThread}`)
      .then((res) => res.json())
      .then((data) => setMessages(data.messages || []));
  }, [selectedThread]);

  return (
    <div className="flex gap-4">
      {/* Threads list */}
      <div className="w-1/4 border p-2 rounded">
        <h2 className="font-semibold mb-2">Saved Conversations</h2>
        {threads.map((t) => (
          <div
            key={t.id}
            onClick={() => setSelectedThread(t.id)}
            className="cursor-pointer p-2 hover:bg-slate-100 rounded"
          >
            {t.title}{" "}
            <span className="text-xs text-muted">
              ({new Date(t.created_at).toLocaleString()})
            </span>
          </div>
        ))}
      </div>

      {/* Messages display */}
      <div className="flex-1 border p-3 rounded max-h-[600px] overflow-y-auto space-y-2">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] px-3 py-2 rounded-lg ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
