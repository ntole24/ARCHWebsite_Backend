const express = require("express");
const router = express.Router();
const Video = require("../model/photo");
const PhotoAlbum = require("../model/photoAlbum");
const multer = require("multer");
const upload = multer({ dest: "tmp/" });
const { uploader } = require("../utils/cloudinary");

/* 
- ***GET** endpoint retrieves all video entries, sorted by upload date.*
- *Each video includes:*
    - *Title, caption, date, embed link, channel, category, contributors, collaborators*
- ***POST** endpoint allows adding new videos*
- ***PUT/PATCH** endpoint edits metadata of a video*
- ***DELETE** endpoint removes a video entry*
*/

// GET: List all photos in an album
router.get("/:albumId", async (req, res) => {
  try {
    const photos = await Photo.find({ album: req.params.albumId }).sort({ date: -1 });
    res.json(photos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Get a single photo by ID
router.get("/:albumId/:photoId", async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.photoId).populate('album');
    if (!photo) {
      return res.status(404).json({ error: "Photo not found" });
    }
    res.json(photo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Create a new photo in an album
router.post("/:albumId", upload.single("image"), async (req, res) => {
  try {
    const { title, contributors } = req.body;
    const newPhoto = new Photo({
      title,
      link: req.file ? await uploader.upload(req.file.path) : null, // Upload to Cloudinary
      album: req.params.albumId,
      contributors: contributors ? contributors.split(",") : []
    });
    await newPhoto.save();
    res.status(201).json(newPhoto);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH: Update a photo
router.patch("/:albumId/:photoId", async (req, res) => {
  try {
    const updated = await Photo.findByIdAndUpdate(req.params.photoId, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ error: "Photo not found" });
    }
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE: Remove a photo
router.delete("/:albumId/:photoId", async (req, res) => {
  try {
    // First, find the photo to get the Cloudinary URL
    const photo = await Photo.findById(req.params.photoId);
    if (!photo) {
      return res.status(404).json({ error: "Photo not found" });
    }

    // Extract public_id from Cloudinary URL to delete from Cloudinary
    if (photo.link) {
      // Extract public_id from URL (e.g., from "https://res.cloudinary.com/demo/image/upload/v1234567890/sample.jpg")
      const urlParts = photo.link.split('/');
      const publicIdWithExtension = urlParts[urlParts.length - 1];
      const publicId = publicIdWithExtension.split('.')[0]; // Remove file extension
      
      // Delete from Cloudinary
      await uploader.destroy(publicId);
    }

    // Then delete from MongoDB
    await Photo.findByIdAndDelete(req.params.photoId);
    
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: List all photo albums
router.get("/", async (req, res) => {
  try {
    const albums = await PhotoAlbum.find().sort({ date: -1 });
    res.json(albums);
  }
  catch (err) {
    res.status(500).json({ error: err.message });
  }
});
