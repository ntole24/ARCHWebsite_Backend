const mongoose = require("mongoose");

// - *Each album includes:*
//    - *Title, date, description, list of photos (in array or other list data struct), channel/dept, category, list of contributors*
const albumSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, default: Date.now },
  description: { type: String, required: true },
  photos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Photo' }], // Array of photo references
  channel: { type: String, required: true }, // channel/dept
  category: { type: String, required: true },
  contributors: [{ type: String }] // Array of contributor names
});

const PhotoAlbum = mongoose.model("PhotoAlbum", albumSchema);
module.exports = PhotoAlbum;  