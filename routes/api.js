var express = require('express');
var router = express.Router();
var videoprocessing = require('../videoprocessing')


// https://www.youtube.com/watch?v=RKYFcHv3DPg
var filename = `${__dirname}/videos.myvideo.mp4`;

router.post('/createclip', (req, res) =>{
  const videoPath = videoprocessing.downloadVideo(req.body.url);
  const sourceFile = `${__dirname}${videoPath}`;
  const clipFile = videoprocessing.cutVideo(sourceFile, req.body.from, req.body.to);
  res.download(clipFile);
})

module.exports = router;
