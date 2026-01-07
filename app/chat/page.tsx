"use client";

import { useEffect, useRef, useState } from "react";

export default function Chat() {
  const [messages, setMessages] = useState<
    { from: string; text: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState("");
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3000/api/ws");
    wsRef.current = ws;

    // pick simple random user for demo
    const uid = `user-${Math.floor(Math.random() * 1000)}`;
    setUserId(uid);

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "register",
          userId: uid,
        })
      );
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      setMessages((prev) => [...prev, msg]);
    };

    ws.onclose = () => console.log("socket closed");

    return () => ws.close();
  }, []);

  const sendMessage = () => {
    if (!wsRef.current) return;

    wsRef.current.send(
      JSON.stringify({
        type: "message",
        text: input,
      })
    );

    setInput("");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Realtime WebSocket Chat</h2>
      <p>Your ID: {userId}</p>

      <div
        style={{
          border: "1px solid gray",
          height: 250,
          overflowY: "auto",
          padding: 10,
          marginBottom: 10,
        }}
      >
        {messages.map((m, i) => (
          <div key={i}>
            <strong>{m.from}:</strong> {m.text}
          </div>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ marginRight: 8 }}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
