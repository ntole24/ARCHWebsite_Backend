const express = require("express");
const router = express.Router();
const Video = require("../model/video");
const multer = require("multer");
const upload = multer({ dest: "tmp/" });
const { uploader } = require("../utils/cloudinary");

/*
VIDEO ROUTES - Endpoints for managing videos within these albums
- Each operation will be separated into 2 sections: MongoDB CRUD and Cloudinary CRUD
- MongoDB operations will be handling the links and the names of the Contributors and more.
- Cloudinary will be handling the video uploads and storage.

List of Operations:
- GET: List all videos
- GET: Get a single video by ID
- POST: Create a new video
- PATCH: Update a video
- DELETE: Remove a video
*/

// MONGODB CRUD

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

// =================
// CLOUDINARY CRUD
// =================

// POST: Upload video to Cloudinary 
router.post("/upload", upload.single("video"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const result = await uploader.upload(req.file.path, { resource_type: "video" });
    res.json({ url: result.secure_url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Get video info from Cloudinary
router.get("/cloudinary/:publicId", async (req, res) => {
  try {
    const result = await uploader.explicit(req.params.publicId, { type: "upload" });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE: Remove video from Cloudinary
router.delete("/cloudinary/:publicId", async (req, res) => {
  try {
    const result = await uploader.destroy(req.params.publicId);
    if (result.result === "ok") {
      res.json({ message: "Video deleted from Cloudinary", result });
    } else {
      res.status(404).json({ error: "Video not found in Cloudinary" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});