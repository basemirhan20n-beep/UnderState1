import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const ROOM = "main-room";

io.on("connection", (socket) => {
  console.log("🔵 Connected:", socket.id);

  socket.join(ROOM);

  socket.on("playerMove", (data) => {
    socket.to(ROOM).emit("playerMove", {
      id: socket.id,
      ...data
    });
  });

  socket.on("disconnect", () => {
    console.log("🔴 Disconnected:", socket.id);
    socket.to(ROOM).emit("playerLeave", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("🚀 Server running on", PORT);
});
