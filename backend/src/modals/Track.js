const mongoose = require('mongoose');

const TrackSchema = new mongoose.Schema({
  title: String,
  artist: String,
  audio: String,
  mood: String,
});

const song = mongoose.model('Track', TrackSchema)
module.exports = song
