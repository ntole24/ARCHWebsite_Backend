const express = require("express");
const router = express.Router();
const Video = require("../model/video");

// GET: List all videos (newest first)
router.get("/", async (req, res) => {
  try {
    const videos = await Video.find().sort({ date: -1 });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Get a single video by ID
router.get("/:id", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
        return res.status(404).json({ error: "Video not found" });
    }
    res.json(video);
    } catch (err) {
    res.status(500).json({ error: err.message });
    }
});

// POST: Create a new video
router.post("/", async (req, res) => {
  try {
    const newVideo = new Video(req.body);
    await newVideo.save();
    res.status(201).json(newVideo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH: Update a video
router.patch("/:id", async (req, res) => {
  try {
    const updated = await Video.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE: Remove a video
router.delete("/:id", async (req, res) => {
  try {
    await Video.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
