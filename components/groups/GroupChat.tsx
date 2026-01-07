"use client";

import { useEffect, useRef, useState } from "react";

interface Message {
  id: number;
  message: string;
  created_at: string;
  sender_name: string;
  sender_tenant_id: number;
}

interface Props {
  groupId: number;
  tenantId: number;
  userId: number;
}

export default function GroupChat({ groupId, tenantId, userId }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // 🔹 Fetch existing messages (HTTP – DB)
  const fetchMessages = async () => {
    const res = await fetch(
      `/api/groups/messages?groupId=${groupId}&tenantId=${tenantId}`
    );
    const data = await res.json();
    setMessages(data.messages || []);
  };

  useEffect(() => {
    fetchMessages();
  }, [groupId]);

  // 🔹 Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🔹 WebSocket connect
  useEffect(() => {
    if (!groupId || !tenantId) return;

    const ws = new WebSocket("ws://localhost:3000/api/ws");
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("🟢 WS connected");

      // register user + group
      ws.send(
        JSON.stringify({
          type: "register",
          userId,
          tenantId,
          groupId,
        })
      );
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      // ❗ apna hi message dobara mat add karo
      if (msg.sender_tenant_id === tenantId) return;

      setMessages((prev) => [...prev, msg]);
    };

    ws.onclose = () => {
      console.log("🔴 WS disconnected");
    };

    ws.onerror = (err) => {
      console.error("❌ WS error", err);
    };

    return () => {
      ws.close();
    };
  }, [groupId, tenantId, userId]);

  // 🔹 Send message
  const sendMessage = async () => {
    if (!text.trim() || !wsRef.current) return;

    setSending(true);

    const payload = {
      groupId,
      tenantId,
      userId,
      message: text,
      sender_name: "You",
      sender_tenant_id: tenantId,
      created_at: new Date().toISOString(),
    };

    // 1️⃣ Optimistic UI
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...payload,
      },
    ]);

    setText("");

    // 2️⃣ Save to DB
    await fetch("/api/groups/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // 3️⃣ Send realtime
    wsRef.current.send(
      JSON.stringify({
        type: "message",
        ...payload,
      })
    );

    setSending(false);
  };

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-2xl border shadow-sm">
      <div className="px-4 py-3 border-b font-semibold text-sm">
        💬 Group Chat
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.map((m) => {
          const isMine = m.sender_tenant_id === tenantId;

          return (
            <div
              key={m.id}
              className={`flex ${
                isMine ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm shadow-sm
                ${
                  isMine
                    ? "bg-indigo-600 text-white"
                    : "bg-white border"
                }`}
              >
                {!isMine && (
                  <div className="text-xs text-gray-500 mb-1">
                    {m.sender_name}
                  </div>
                )}
                {m.message}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t flex gap-2">
        <input
          className="flex-1 border rounded-xl px-4 py-2"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          disabled={sending}
          className="bg-indigo-600 text-white px-5 rounded-xl"
        >
          Send
        </button>
      </div>
    </div>
  );
}
