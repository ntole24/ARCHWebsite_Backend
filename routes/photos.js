const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "tmp/" });
const Photo = require("../models/Photo");
const { uploader } = require("../utils/cloudinary");

// GET all photos (newest first)
router.get("/", async (req, res) => {
  try {
    const photos = await Photo.find().sort({ _id: -1 });
    res.json(photos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new photo
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { title, label, source } = req.body;

    if (!req.file) return res.status(400).json({ error: "No image file uploaded." });
    if (!["A&G", "Photo Album"].includes(label)) return res.status(400).json({ error: "Invalid label." });

    // Upload image to Cloudinary
    const result = await uploader(req.file.path, {
      folder: "arch_photos",
      resource_type: "image",
    });

    const newPhoto = new Photo({
      title,
      link: result.secure_url,
      publicId: result.public_id,
      label,
      source,
    });

    await newPhoto.save();
    res.status(201).json(newPhoto);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH (edit title, label, or source only)
router.patch("/:id", async (req, res) => {
  try {
    const { title, label, source } = req.body;

    const updated = await Photo.findByIdAndUpdate(
      req.params.id,
      { ...(title && { title }), ...(label && { label }), ...(source && { source }) },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a photo (from DB + Cloudinary)
router.delete("/:id", async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) return res.status(404).json({ error: "Photo not found." });

    // Delete from Cloudinary
    const cloudinary = require("cloudinary").v2;
    await cloudinary.uploader.destroy(photo.publicId, { resource_type: "image" });

    // Delete from DB
    await photo.deleteOne();
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
