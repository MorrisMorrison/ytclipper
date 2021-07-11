var express = require('express');
var router = express.Router();
var videoprocessing = require('../videoprocessing')


// https://www.youtube.com/watch?v=RKYFcHv3DPg
var filename = `/home/morrismorrison/Development/ytclipper/videos/myvideo.mp4`;
var clipname = `/home/morrismorrison/Development/ytclipper/videos/myclip.mp4`;

router.post('/createclip', async (req, res) =>{
  console.log("SERVER -- CLIENT REQUEST -- CREATE CLIP");
  // var jobId = videoprocessing.downloadVideo(req.body.url, () => videoprocessing.cutVideo(filename, req.body.from, req.body.to));
  var stuff = videoprocessing.downloadVideoAsync(req.body.url, () => videoprocessing.cutVideoAsync(filename, req.body.from, req.body.to))
                      .then(videoName => {
                        console.log('SERVER -- PROMISE RESULT: ' + videoName);
                        res.status = 200;
                        res.send(videoName);
                      });                      
})

router.get('status', (req, res) => {
  console.log("SERVER -- CLIENT REQUEST -- STATUS");
})

router.get('/download', (req, res) => {
  console.log('SERVER -- CLIENT REQUEST -- DOWNLOAD');
  console.log('SERVER -- VIDEO NAME: ' + req.query.videoName);
  res.download(clipname)
})

module.exports = router;

