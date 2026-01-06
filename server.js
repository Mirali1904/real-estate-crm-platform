const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  // Socket.IO setup
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 Client connected:", socket.id);

    // Join group
    socket.on("join_group", (groupId) => {
      const room = `group_${groupId}`;
      socket.join(room);
      console.log(`✅ Socket ${socket.id} joined ${room}`);
    });

    // Send message
    socket.on("send_message", (data) => {
     
      
      // Broadcast to ALL users in the group
      io.to(`group_${data.groupId}`).emit("new_message", {
        id: Date.now(),
        message: data.message,
        sender_name: data.sender_name,
        sender_tenant_id: data.sender_tenant_id,
        created_at: data.created_at || new Date().toISOString(),
      });
    });

    socket.on("disconnect", () => {
      console.log("🔴 Client disconnected:", socket.id);
    });
  });

  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`✅ Next.js ready on http://${hostname}:${port}`);
    console.log("🚀 Socket.IO server running");
  });
});