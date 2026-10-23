
const reportRoutes = require("./routes/reportRoutes");
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const labRoutes = require("./routes/labRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const adminRoutes = require("./routes/adminRoutes");
const agentRoutes = require("./routes/agentRoutes");

const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Parse JSON request bodies
app.use(express.json({ limit: "1mb" }));

// Home route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "LabSetu API is running",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/labs", labRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/agent", agentRoutes);

// Error middleware MUST come after all routes
app.use(errorMiddleware);

// Start server
async function startServer() {
  try {
    await connectDB();

    const port = process.env.PORT || 5000;

    app.listen(port, () => {
      console.log(`LabSetu API running on port ${port}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
