require("dotenv").config();
const express = require("express");
const cors = require("cors");

const priceRoutes = require("./routes/prices");
const portfolioRoutes = require("./routes/portfolio");

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ message: "FinTrack API is running" });
});

// Routes
app.use("/api/prices", priceRoutes);
app.use("/api/portfolio", portfolioRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});