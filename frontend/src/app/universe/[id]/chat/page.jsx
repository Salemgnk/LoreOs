"use client";

import { useState } from "react";

export default function ChatPage({ params }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // TODO: Appel SSE vers /universes/{id}/chat
    // Pour l'instant, placeholder
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "🔧 Le LoreChat sera connecté au backend RAG bientôt !",
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="mb-4">
        <h1 className="text-3xl font-bold">🧠 LoreChat</h1>
        <p className="text-[var(--text-secondary)]">
          Pose des questions sur ton univers en langage naturel.
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.length === 0 && (
          <div className="text-center text-[var(--text-secondary)] mt-20">
            <p className="text-4xl mb-4">🧠</p>
            <p>Pose ta première question sur ton univers.</p>
            <p className="text-sm mt-2 italic">
              "Quels personnages vivent dans la région nord ?"
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] px-4 py-3 rounded-xl ${
                msg.role === "user"
                  ? "bg-lore-600 text-white"
                  : "bg-[var(--bg-card)] border border-white/5"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pose une question sur ton univers..."
          className="flex-1 px-4 py-3 rounded-xl bg-[var(--bg-card)] border border-white/10 focus:border-lore-500 focus:outline-none"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-lore-600 hover:bg-lore-700 rounded-xl font-medium transition-colors"
        >
          Envoyer
        </button>
      </form>
    </div>
  );
}
