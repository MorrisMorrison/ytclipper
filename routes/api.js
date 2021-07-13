var express = require('express');
var router = express.Router();
var videoprocessing = require('../videoprocessing');
var path = require('path');
var appDir = path.dirname(require.main.filename);

var videoPathTemplate = (appDir + `/videos/`).replace('/bin', '');
const videoFileNameEnding = ".mp4"
const clipFileNameEnding = "_clip" + videoFileNameEnding;

const isYoutubeUrlValid = (url) => /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/.test(url);
const isCreateClipRequestValid = (req) => (req.body != '') && (req.body.url != '') && isYoutubeUrlValid(req.body.url);
const getVideoIdByYoutubeUrl = (url) => {
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = url.match(regExp);
    return (match&&match[7].length==11)? match[7] : false;
}

router.post('/createclip', async (req, res) =>{
  if(!isCreateClipRequestValid(req)) {
    res.status = 500;
    return;
  }

  const videoId = getVideoIdByYoutubeUrl(req.body.url);
  var fileName = videoPathTemplate + videoId + videoFileNameEnding;
  var clipName =  videoPathTemplate + videoId + clipFileNameEnding;
  
  videoprocessing.downloadVideoAsync(req.body.url, fileName, videoId + ".mp4", () => videoprocessing.cutVideoAsync(fileName, clipName, req.body.from, req.body.to))
                      .then(videoName => {
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

  res.download(videoPathTemplate + req.query.videoName);
})

module.exports = router;

