const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  link: { type: String, required: true },
  publicId: { type: String, required: true }, // For cloud storage
  label: {
    type: String,
    enum: ["A&G", "Photo Album"],
    required: true,
  },
  source: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  }
});

module.exports = mongoose.model("Photo", photoSchema);