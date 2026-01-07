export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { WebSocketServer, WebSocket } from "ws";

type ExtWebSocket = WebSocket & { id?: string };

let wss: WebSocketServer | undefined;

function getWSS() {
  if (!wss) {
    wss = new WebSocketServer({ noServer: true });

    wss.on("connection", (ws: ExtWebSocket) => {
      console.log("🟢 Client connected");

      ws.on("message", (data) => {
        const msg = JSON.parse(data.toString());

        if (msg.type === "register") {
          ws.id = msg.userId;
          return;
        }

        if (msg.type === "message") {
          wss?.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(
                JSON.stringify({
                  from: ws.id,
                  text: msg.text,
                })
              );
            }
          });
        }
      });

      ws.on("close", () => console.log("🔴 Client disconnected"));
    });
  }

  return wss;
}

export async function GET(req: NextRequest) {
  const { socket }: any = req;

  if (!socket) return new Response("No socket", { status: 400 });

  const wss = getWSS();

  socket.server.on("upgrade", (request: any, socket: any, head: any) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  });

  return new Response(null, { status: 101 });
}
