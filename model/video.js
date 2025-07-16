const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: Date,
  embedLink: String,
  channel: String,
  category: String,
  contributors: [String], // store Talent IDs
  collaborators: [String], // store Channel IDs/names
});

const Video = mongoose.model("Video", videoSchema);
module.exports = Video;