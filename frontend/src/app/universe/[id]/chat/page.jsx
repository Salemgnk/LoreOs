"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { chat as chatApi } from "@/lib/api";

export default function ChatPage() {
  const { id: universeId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  // Charger l'historique au montage
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await chatApi.history(universeId);
        setMessages(history.map((h) => ({ role: h.role, content: h.content })));
      } catch (e) {
        console.error("Erreur chargement historique:", e);
      } finally {
        setLoadingHistory(false);
      }
    };
    loadHistory();
  }, [universeId]);

  useEffect(scrollToBottom, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || streaming) return;

    const question = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setStreaming(true);

    // Ajouter un message assistant vide pour le streaming
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const response = await chatApi.ask(universeId, question);

      if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: "Erreur inconnue" }));
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: `❌ Erreur: ${err.detail || "Erreur serveur"}` };
          return updated;
        });
        setStreaming(false);
        return;
      }

      // Lire le stream SSE
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const token = line.slice(6);
            if (token === "[DONE]") continue;
            setMessages((prev) => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              updated[updated.length - 1] = { ...last, content: last.content + token };
              return updated;
            });
          }
        }
      }
    } catch (e) {
      console.error("Erreur chat:", e);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: "❌ Erreur de connexion au serveur." };
        return updated;
      });
    } finally {
      setStreaming(false);
    }
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
        {loadingHistory ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-lore-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-[var(--text-secondary)] mt-20">
            <p className="text-4xl mb-4">🧠</p>
            <p>Pose ta première question sur ton univers.</p>
            <div className="mt-4 space-y-2">
              {[
                "Quels personnages vivent dans la région nord ?",
                "Décris les factions principales de mon univers",
                "Quels lieux sont liés à des batailles ?",
              ].map((q) => (
                <button key={q} onClick={() => setInput(q)}
                  className="block mx-auto text-sm px-4 py-2 bg-[var(--bg-card)] border border-white/5 rounded-lg hover:border-lore-500/30 transition-all">
                  💬 "{q}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[70%] px-4 py-3 rounded-xl ${
                msg.role === "user"
                  ? "bg-lore-600 text-white"
                  : "bg-[var(--bg-card)] border border-white/5"
              }`}>
                <p className="whitespace-pre-wrap">{msg.content || (streaming && i === messages.length - 1 ? "..." : "")}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pose une question sur ton univers..."
          disabled={streaming}
          className="flex-1 px-4 py-3 rounded-xl bg-[var(--bg-card)] border border-white/10 focus:border-lore-500 focus:outline-none disabled:opacity-50"
        />
        <button type="submit" disabled={streaming || !input.trim()}
          className="px-6 py-3 bg-lore-600 hover:bg-lore-700 rounded-xl font-medium transition-colors disabled:opacity-50">
          {streaming ? "⏳" : "Envoyer"}
        </button>
      </form>
    </div>
  );
}
