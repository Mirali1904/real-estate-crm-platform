"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Send, Users, Wifi, WifiOff } from "lucide-react";

interface Message {
  id: number;
  message: string;
  created_at: string;
  sender_name: string;
  sender_tenant_id: number;
  sender_user_id: number;
}

interface Props {
  groupId: number;
  tenantId: number;
  userId: number;
   onMessageChange?: () => void;
}

export default function GroupChat({
  groupId,
  tenantId,
  userId,
  onMessageChange,
}: Props) {

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);
  const [userName, setUserName] = useState("You");

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Get user name from localStorage
  useEffect(() => {
    const raw = localStorage.getItem("loggedUser");
    if (raw) {
      try {
        const user = JSON.parse(raw);
        setUserName(user.name || user.username || "You");
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }
  }, []);

  // Fetch existing messages
  const fetchMessages = async () => {
    try {
      const res = await fetch(
        `/api/groups/messages?groupId=${groupId}&tenantId=${tenantId}`
      );
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [groupId, tenantId]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Socket.IO connect
  useEffect(() => {
    if (!groupId || !tenantId || !userId) return;

    const socket = io(window.location.origin, {
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join-group", { groupId, userId, tenantId });
    });

    socket.on("new-message", (msg: Message) => {
  if (msg.sender_user_id === userId && msg.sender_tenant_id === tenantId) {
    return;
  }

  setMessages((prev) => [...prev, msg]);

  // ✅ notify parent to update message count
  onMessageChange?.();
});


    socket.on("connect_error", (error) => {
      console.error("❌ Connection error:", error);
      setConnected(false);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    return () => {
      socket.emit("leave-group", { groupId });
      socket.disconnect();
    };
  }, [groupId, tenantId, userId]);

  // Send message
  const sendMessage = async () => {
    if (!text.trim() || !socketRef.current || !connected) return;

    setSending(true);

    const messageText = text.trim();
    const tempId = Date.now();

    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        message: messageText,
        sender_name: userName,
        sender_tenant_id: tenantId,
        sender_user_id: userId,
        created_at: new Date().toISOString(),
      },
    ]);

    setText("");

    try {
      await fetch("/api/groups/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId,
          tenantId,
          userId,
          message: messageText,
          sender_name: userName,
        }),
      });

      socketRef.current.emit("send-group-message", {
        groupId,
        tenantId,
        userId,
        message: messageText,
        sender_name: userName,
      });

    
onMessageChange?.();

    } catch (error) {
      console.error("❌ Error sending message:", error);
    }

    setSending(false);
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header - Blue Theme */}
      <div className="bg-blue-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">Group Chat</h2>
            <p className="text-blue-100 text-xs">
              {messages.length} message{messages.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {connected ? (
            <div className="flex items-center gap-2 bg-green-500/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <Wifi className="w-4 h-4 text-green-300" />
              <span className="text-xs text-green-100 font-medium">Online</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-red-500/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <WifiOff className="w-4 h-4 text-red-300" />
              <span className="text-xs text-red-100 font-medium">Offline</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-blue-50 rounded-full p-6 shadow-md mb-4">
              <Users className="w-12 h-12 text-blue-900" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No messages yet
            </h3>
            <p className="text-gray-500 text-sm">
              Start the conversation with your team! 👋
            </p>
          </div>
        )}

        {messages.map((m) => {
          const isMine =
            m.sender_user_id === userId && m.sender_tenant_id === tenantId;

          return (
            <div
              key={m.id}
              className={`flex gap-3 ${isMine ? "flex-row-reverse" : "flex-row"} items-end`}
            >
              {/* Avatar */}
              {!isMine && (
                <div
  className="bg-blue-900 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0"
>
  {getInitials(m.sender_name)}
</div>

              )}

              {/* Message Bubble */}
              <div
                className={`flex flex-col max-w-[70%] ${isMine ? "items-end" : "items-start"}`}
              >
                {!isMine && (
                  <span className="text-xs font-semibold text-gray-600 mb-1 px-1">
                    {m.sender_name}
                  </span>
                )}

                <div
                  className={`px-4 py-3 rounded-2xl shadow-sm ${
                    isMine
                      ? "bg-blue-900 text-white rounded-br-sm"
                      : "bg-white text-gray-800 rounded-bl-sm border border-gray-200"
                  }`}
                >
                  <p className="text-sm leading-relaxed break-words">
                    {m.message}
                  </p>
                </div>

                <span
                  className={`text-xs mt-1 px-1 ${
                    isMine ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  {new Date(m.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {/* Your Avatar - Blue */}
              {isMine && (
                <div className="bg-blue-900 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                  {getInitials(userName)}
                </div>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent resize-none transition-all duration-200 max-h-32"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Type your message..."
              disabled={!connected}
              rows={1}
              style={{
                height: "auto",
                minHeight: "44px",
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = target.scrollHeight + "px";
              }}
            />
          </div>

          <button
            onClick={sendMessage}
            disabled={sending || !connected || !text.trim()}
            className="bg-blue-900 text-white p-3 rounded-2xl hover:bg-blue-900 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 flex-shrink-0"
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}