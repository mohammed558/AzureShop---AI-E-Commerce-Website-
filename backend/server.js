require("dotenv").config();
const express = require("express");
const cors = require("cors");

const productRoutes = require("./routes/products");
const chatRoutes = require("./routes/chat");
const speechRoutes = require("./routes/speech");
const recommendRoutes = require("./routes/recommendations");

const app = express();

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors()); // Allow all for production test, refine later
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use("/api/products", productRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/speech", speechRoutes);
app.use("/api/recommendations", recommendRoutes);

// ── Health Check ───────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => res.json({ status: "OK", source: "Vercel" }));

// ── Global Error Handler ───────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

// For local development only
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
}

module.exports = app;
