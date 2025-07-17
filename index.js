import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// load environment variables from .env
dotenv.config();

// import routes
import indexRoutes from "./routes/indexRoutes.js";

// creates express instance
const app = express();

// middleware to parse JSON
app.use(express.json());

// middleware to enable CORS
app.use(cors());

// uses routes defined in indexRoutes.js
app.use("/", indexRoutes);

// listens on a defined port (e.g., 3000)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
