const express = require('express');
const router = express.Router();
const videoprocessing = require('../core/videoprocessing');
const path = require('path');
const { fork } = require('child_process');

const appDir = path.dirname(require.main.filename);

const videoPathTemplate = (appDir + `/videos/`).replace('/bin', '');
const videoFileNameEnding = ".mp4"
const clipFileNameEnding = "_clip" + videoFileNameEnding;

const isYoutubeUrlValid = (url) => /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/.test(url);
const isCreateClipRequestValid = (req) => (req.body != '') && (req.body.url != '') && isYoutubeUrlValid(req.body.url);
const getVideoIdByYoutubeUrl = (url) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length == 11) ? match[7] : false;
}

const jobStatus = {
    RUNNING: "running",
    DONE: "done",
    ERROR: "error",
    TIMEOUT: "timeout",
    CREATED: "created"
}
var jobQueue = [];

const getJobId = () => {
    for (i = 0; i < 10; i++) {
        if (jobQueue[i] === undefined || jobQueue[i] === '' && jobQueue[i] || {}) {
            return i;
        }
    }

    return -1;
}


router.get('/getjobstatus', (req, res) => {
    console.log('SERVER - GETJOBSTATUS');

    if (jobQueue[req.query.jobId] != undefined && jobQueue[req.query.jobId] != '' && jobQueue[req.query.jobId] != {}) {
        switch (jobQueue[req.query.jobId].status) {
            case 'created':
                res.status(201).send();
                break;
            case 'running':
                res.status(201).send();
                break;
            case 'done':
                res.status(200).send(jobQueue[req.query.jobId].clipName);
                break;
            case 'timeout':
                res.status(408).send();
                break;
            case 'error':
                res.status(500).send();
                break;
        }
    }

    res.status(400);
})

router.post('/createclip', (req, res) => {
    console.log('SERVER - CREATECLIP')
    if (!isCreateClipRequestValid(req)) {
        res.status(500);
        return;
    }
    console.log('SERVER - CREATECLIP - Request is valid')

    var jobId = getJobId();
    // Everything is busy
    if (jobId == -1) {
        res.status(500);
        return;
    }

    console.log('SERVER - CREATECLIP - JobId is available')

    jobQueue[jobId] = {
        status: jobStatus.CREATED,
    }

    console.log('SERVER - CREATECLIP - Job created with id ' + jobId)

    const videoId = getVideoIdByYoutubeUrl(req.body.url);
    const fileName = videoPathTemplate + videoId + videoFileNameEnding;
    const clipName = videoPathTemplate + videoId + clipFileNameEnding;

    console.log('SERVER - CREATECLIP - VideoId extracted')

    const processDownloadVideo = fork('core/downloadVideo.js');
    const processCutVideo = fork('core/cutVideo.js');
    const clipFileName = videoId + '_clip.mp4';

    processDownloadVideo.send({
        url: req.body.url,
        fileName: fileName,
        videoName: videoId + '.mp4'
    });

    console.log('SERVER - CREATECLIP - Downloading video in child process started');
    console.log('SERVER - CREATECLIP - Downloading video from url: ' + req.body.url);
    console.log('SERVER - CREATECLIP - Saving downloaded video in: ' + fileName);

    processDownloadVideo.on('message', async (processDownloadResult) => {
        console.log('SERVER - CREATECLIP - Downloading video finished')
        processCutVideo.send({
            fileName: fileName,
            clipName: clipName,
            from: req.body.from,
            to: req.body.to
        })
        console.log('SERVER - CREATECLIP - Cutting video started')


        processCutVideo.on('message', (processCutResult) => {
            console.log('SERVER - CREATECLIP - Cutting video finished')
            jobQueue[jobId] = {
                status: jobStatus.DONE,
                clipName: clipFileName
            };
        })
    })

    res.status(201).send(JSON.stringify(jobId));
})

const isDownloadRequestValid = (req) => req.query.videoName != '';
router.get('/download', (req, res) => {
    console.log('SERVER - DOWNLOAD')
    if (!isDownloadRequestValid(req)) {
        res.status(500);
        return;
    }
    res.download(videoPathTemplate + req.query.videoName);
})

const isGetVideoDurationRequestValid = (req) => req.query.youtubeUrl != '';
router.get('/getvideoduration', async (req, res) => {
    console.log('SERVER - GETVIDEODURATION');

    if (!isGetVideoDurationRequestValid(req)) {
        res.status(500);
        return;
    }
    videoprocessing.getVideoDurationAsync(req.query.youtubeUrl).then(duration => {
        res.status(200).send(duration);
    })
})

module.exports = router;

