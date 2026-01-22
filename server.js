const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT, 10) || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Request error:", err);
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    

    socket.on("join-group", ({ groupId, userId, tenantId }) => {
      const roomId = `group_${groupId}`;
      socket.join(roomId);
      
      socket.userId = userId;
      socket.tenantId = tenantId;
      socket.groupId = groupId;
      
      
    });

    socket.on("send-group-message", (data) => {
    

      const roomId = `group_${data.groupId}`;

      const broadcastData = {
        id: Date.now(),
        message: data.message,
        sender_name: data.sender_name,
        sender_user_id: data.userId,
        sender_tenant_id: data.tenantId,
        created_at: new Date().toISOString(),
      };

     

      socket.to(roomId).emit("new-message", broadcastData);

      
    });

    socket.on("leave-group", ({ groupId }) => {
      const roomId = `group_${groupId}`;
      socket.leave(roomId);
      
    });

    socket.on("disconnect", () => {
      
    });
  });

  httpServer.listen(port, () => {
    console.log(`🚀 Server running at http://${hostname}:${port}`);
  });
});