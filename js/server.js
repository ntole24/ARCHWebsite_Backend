require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const videoRoutes = require("../routes/videos");
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

// Routes
app.use("/videos", videoRoutes);

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));