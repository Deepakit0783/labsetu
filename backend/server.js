
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const labRoutes = require("./routes/labRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const reportRoutes = require("./routes/reportRoutes");
const adminRoutes = require("./routes/adminRoutes");
const agentRoutes = require("./routes/agentRoutes");

const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

app.use(
  cors({
    origin: [
      process.env.CLIENT_URL || "http://localhost:5173",
      process.env.FRONTEND_URL || "http://localhost:5173",
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));

// Database connection ko har request se pehle ensure karein
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "LabSetu API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/labs", labRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/agent", agentRoutes);

app.use(errorMiddleware);

// Vercel ke liye app export karein
module.exports = app;

// Local computer par server start karein
if (require.main === module) {
  const port = process.env.PORT || 5000;

  app.listen(port, () => {
    console.log(`LabSetu API running on port ${port}`);
  });
}
