const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  link: { type: String, required: true }, // Cloudinary URL
  album: { type: mongoose.Schema.Types.ObjectId, ref: 'PhotoAlbum', required: true }, // Album ID
});

module.exports = mongoose.model("Photo", photoSchema);