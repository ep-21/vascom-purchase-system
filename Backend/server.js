const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const requestRoutes = require("./routes/requestRoutes");
const financeRoutes = require("./routes/financeRoutes");
const managerRoutes = require("./routes/managerRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api", authRoutes);
app.use("/api", requestRoutes);
app.use("/api", financeRoutes);
app.use("/api/manager", managerRoutes);

// Error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "Server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));