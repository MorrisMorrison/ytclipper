const express = require('express');
const router = express.Router();
const videoprocessing = require('../videoprocessing');
const path = require('path');
const appDir = path.dirname(require.main.filename);

const videoPathTemplate = (appDir + `/videos/`).replace('/bin', '');
const videoFileNameEnding = ".mp4"
const clipFileNameEnding = "_clip" + videoFileNameEnding;

const isYoutubeUrlValid = (url) => /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/.test(url);
const areTimestampsWithinVideoDuration = (from, to, duration) => {
  return true;
}
const isCreateClipRequestValid = (req) => (req.body != '') && (req.body.url != '') && isYoutubeUrlValid(req.body.url);
const getVideoIdByYoutubeUrl = (url) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match&&match[7].length==11)? match[7] : false;
}

router.post('/createclip', async (req, res) =>{
  videoprocessing.getVideoDurationAsync(req.body.url).then(duration => {
    if (!areTimestampsWithinVideoDuration(req.from, req.to, duration)){
      res.status = 500;
      return;
    }

    if(!isCreateClipRequestValid(req)) {
      res.status = 500;
      return;
    }
  
    const videoId = getVideoIdByYoutubeUrl(req.body.url);
      const fileName = videoPathTemplate + videoId + videoFileNameEnding;
      const clipName = videoPathTemplate + videoId + clipFileNameEnding;

      videoprocessing.downloadVideoAsync(req.body.url, fileName, videoId + ".mp4", () => videoprocessing.cutVideoAsync(fileName, clipName, req.body.from, req.body.to))
                        .then(videoName => {
                          res.status = 200;
                          res.send(videoName);
                        });      
  })
})

const isDownloadRequestValid = (req) => req.query.videoName != '';
router.get('/download', (req, res) => {
  if(!isDownloadRequestValid(req)) {
    res.status = 500;
    return;
  }

  res.download(videoPathTemplate + req.query.videoName);
})

const isGetVideoDurationRequestValid = (req) => req.query.youtubeUrl != '';
router.get('/getvideoduration', async(req,res) => {
    if (!isGetVideoDurationRequestValid(req)){
        res.status = 500;
        return;
    }
    videoprocessing.getVideoDurationAsync(req.query.youtubeUrl).then(duration =>{
        res.status = 200;
        res.send(duration);
  })
})

module.exports = router;

