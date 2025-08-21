const express = require("express");
const router = express.Router();
const Photo = require("../model/photo");
const PhotoAlbum = require("../model/photoAlbum");
const multer = require("multer");
const upload = multer({ dest: "tmp/" });
const { uploader } = require("../utils/cloudinary");

/*
PHOTO ROUTES - Endpoints for managing photo albums and photos within those albums
- Each operation will be separated into 2 sections: MongoDB CRUD and Cloudinary CRUD
- MongoDB operations will be handling the links and the names of the Contributors and more.
- Cloudinary will be handling the image uploads and storage.

List of Operations:
GET    /                       → List all albums
GET    /album/:albumId         → Get single album
GET    /:albumId/photos        → List photos in album  
GET    /:albumId/:photoId      → Get single photo
POST   /:albumId               → Create photo with upload
PATCH  /:albumId/:photoId      → Update photo
PATCH  /album/:albumId         → Update album
DELETE /:albumId/:photoId      → Delete photo
DELETE /album/:albumId         → Delete album
POST   /upload                 → Cloudinary upload only
GET    /cloudinary/:publicId   → Get Cloudinary info
DELETE /cloudinary/:publicId   → Delete from Cloudinary
*/

// [MONGODB CRUD]

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

// GET: Get a single photo album by ID
router.get("/album/:albumId", async (req, res) => {
  try {
    const album = await PhotoAlbum.findById(req.params.albumId);
    if (!album) {
      return res.status(404).json({ error: "Album not found" });
    }
    res.json(album);
  }
  catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: List all photos in an album 
router.get("/:albumId/photos", async (req, res) => {
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
    let cloudinaryUrl = null;
    if (req.file) {
      const result = await uploader.upload(req.file.path);
      cloudinaryUrl = result.secure_url;
    }
    // Check if link is required but missing
    if (!cloudinaryUrl) {
      return res.status(400).json({ error: "Image file is required" });
    }
    const newPhoto = new Photo({
      title,
      link: cloudinaryUrl,
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

// PATCH: Update photo album
router.patch("/album/:albumId", async (req, res) => {
  try {
    const updated = await PhotoAlbum.findByIdAndUpdate(req.params.albumId, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ error: "Album not found" });
    }
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE: Remove a photo
router.delete("/:albumId/:photoId", async (req, res) => {
  try {
    const deleted = await Photo.findByIdAndDelete(req.params.photoId);
    if (!deleted) {
      return res.status(404).json({ error: "Photo not found" });
    }
    res.json({ message: "Photo metadata deleted", deletedPhoto: deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE: Remove photo album
router.delete("/album/:albumId", async (req, res) => {
  try {
    // First check if album has photos
    const photosInAlbum = await Photo.find({ album: req.params.albumId });
    if (photosInAlbum.length > 0) {
      return res.status(400).json({ 
        error: "Cannot delete album with existing photos. Delete photos first." 
      });
    }
    const deleted = await PhotoAlbum.findByIdAndDelete(req.params.albumId);
    if (!deleted) {
      return res.status(404).json({ error: "Album not found" });
    }  
    res.json({ message: "Album deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// [CLOUDINARY CRUD]

// POST: Upload image to Cloudinary only
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }
    const result = await uploader.upload(req.file.path);
    res.json({ url: result.secure_url, publicId: result.public_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Get image info from Cloudinary
router.get("/cloudinary/:publicId", async (req, res) => {
  try {
    const result = await uploader.explicit(req.params.publicId, { type: "upload" });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE: Remove image from Cloudinary only
router.delete("/cloudinary/:publicId", async (req, res) => {
  try {
    const result = await uploader.destroy(req.params.publicId);
    if (result.result === "ok") {
      res.json({ message: "Image deleted from Cloudinary", result });
    } else {
      res.status(404).json({ error: "Image not found in Cloudinary" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;