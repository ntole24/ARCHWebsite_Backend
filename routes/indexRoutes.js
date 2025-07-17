import express from "express";
const router = express.Router();

// basic route (/) responds with a JSON message.
router.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

export default router;
