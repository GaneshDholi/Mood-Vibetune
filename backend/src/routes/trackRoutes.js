const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadFile = require('../services/storage.services');
const Track = require('../modals/Track');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/songs', upload.single("audio"), async (req, res) => {
  console.log(req.body)
  console.log(req.file)
  const fileData = await uploadFile(req.file);
  console.log(fileData);

  try {
    const song = await Track.create({
      title: req.body.title,
      artist: req.body.artist,
      audio: fileData.url,
      mood: req.body.mood
    });

    res.status(201).json({
      message: 'Song Created successfully',
      song: song
    });
  } catch (err) {
    console.error(" Mongo Save Error:", err);
    res.status(500).json({ error: 'MongoDB save failed', details: err.message });
  }
});



router.get('/:mood', async (req, res) => {
  const mood = req.params.mood;
  try {
    const tracks = await Track.find({ mood });
    res.json(tracks);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
