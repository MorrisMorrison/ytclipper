var express = require('express');
var router = express.Router();
var videoprocessing = require('../videoprocessing')

// https://www.youtube.com/watch?v=RKYFcHv3DPg

const filename = `/home/morrismorrison/Development/ytclipper/videos/myvideo.mp4`;
const clipname = `/home/morrismorrison/Development/ytclipper/videos/myclip.mp4`;
const isYoutubeUrlValid = (url) => /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/.test(url);
const isCreateClipRequestValid = (req) => req.body == '' || req.body.url == '' || !isYoutubeUrlValid(req.body.url);

router.post('/createclip', async (req, res) =>{
  if(!isCreateClipRequestValid(req)) {
    res.status = 500;
    return;
  }
  console.log("SERVER -- CLIENT REQUEST -- CREATE CLIP");
  // var jobId = videoprocessing.downloadVideo(req.body.url, () => videoprocessing.cutVideo(filename, req.body.from, req.body.to));
  var stuff = videoprocessing.downloadVideoAsync(req.body.url, () => videoprocessing.cutVideoAsync(filename, req.body.from, req.body.to))
                      .then(videoName => {
                        console.log('SERVER -- PROMISE RESULT: ' + videoName);
                        res.status = 200;
                        res.send(videoName);
                      });                      
})

const isDownloadRequestValid = (req) => req.query.videoName != '';
router.get('/download', (req, res) => {
  if(!isDownloadRequestValid(req)) {
    res.status = 500;
    return;
  }

  console.log('SERVER -- CLIENT REQUEST -- DOWNLOAD');
  console.log('SERVER -- VIDEO NAME: ' + req.query.videoName);
  res.download(clipname)
})

module.exports = router;

