require("dotenv").config();
const express = require("express");
const cors = require("cors");

const priceRoutes = require("./routes/prices");
const portfolioRoutes = require("./routes/portfolio");

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", priceRoutes);
app.use("/api", portfolioRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "FinTrack API is running" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});