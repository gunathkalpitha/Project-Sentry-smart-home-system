import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { PORT, MONGODB_URI, CORS_ORIGIN } from "./config.js";

import authRoutes from "./routes/auth.js";
import deviceRoutes from "./routes/devices.js";
import readingRoutes from "./routes/readings.js";
import relayRoutes from "./routes/relays.js";
import reportRoutes from "./routes/reports.js";
import wifiRoutes from "./routes/wifi.js";


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: CORS_ORIGIN, methods: ["GET", "POST", "PUT", "DELETE"] },
});

// Socket.IO event bridge
app.set("io", io);
io.on("connection", (socket) => {
  console.log("✅ Client connected:", socket.id);
  socket.on("disconnect", () =>
    console.log("❌ Client disconnected:", socket.id)
  );
});

// Middleware
app.use(helmet());
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.get("/", (req, res) => res.json({ ok: true, service: "Sentry API" }));
app.use("/api/auth", authRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/api/readings", readingRoutes);
app.use("/api/relays", relayRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/wifi", wifiRoutes);


// DB + start
if (!MONGODB_URI) {
  console.error("❌ No MONGODB_URI found in .env");
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB Atlas connected");
    server.listen(PORT, () =>
      console.log(`🚀 API running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });
