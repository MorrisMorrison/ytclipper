const express = require("express");
const router = express.Router();
const videoprocessing = require("../core/videoprocessing");
const path = require("path");
const { fork } = require("child_process");

const appDir = path.dirname(require.main.filename);

const videoPathTemplate = (appDir + `/videos/`).replace("/bin", "");
const videoFileNameEnding = ".mp4";
const clipFileNameEnding = "_clip" + videoFileNameEnding;

const jobStatus = {
  RUNNING: "running",
  DONE: "done",
  ERROR: "error",
  TIMEOUT: "timeout",
  CREATED: "created",
};
const jobQueue = [];
const JOB_QUEUE_SIZE = 10;

const isYoutubeUrlValid = (url) =>
  /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/.test(
    url
  );

const isCreateClipRequestValid = (req) =>
  req.body && req.body.url && isYoutubeUrlValid(req.body.url);

const getVideoIdByYoutubeUrl = (url) => {
  const regExp =
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[7] && match[7].length === 11 ? match[7] : false;
};

const findAvailableJobId = () => {
  for (let i = 0; i < JOB_QUEUE_SIZE; i++) {
    const job = jobQueue[i];
    const isJobIdAvailable =
      job === undefined ||
      job === null ||
      job.status === jobStatus.DONE ||
      job.status === jobStatus.ERROR ||
      job.status === jobStatus.TIMEOUT;
    if (isJobIdAvailable) {
      return i;
    }
  }

  return -1;
};

const handleJobStatus = (res, jobId) => {
  const job = jobQueue[jobId];

  if (!job) {
    res.status(400).send();
    return;
  }

  switch (job.status) {
    case jobStatus.CREATED:
    case jobStatus.RUNNING:
      res.status(201).send();
      break;
    case jobStatus.DONE:
      res.status(200).send(job.clipName);
      break;
    case jobStatus.TIMEOUT:
      res.status(408).send();
      break;
    case jobStatus.ERROR:
      res.status(500).send();
      break;
    default:
      res.status(400).send();
  }
};

const createJob = (jobId) => {
  jobQueue[jobId] = { status: jobStatus.CREATED };
};

router.get("/getjobstatus", (req, res) => {
  console.log("SERVER - GETJOBSTATUS");
  const jobId = req.query.jobId;

  handleJobStatus(res, jobId);
});

router.post("/createclip", async (req, res) => {
  console.log("SERVER - CREATECLIP");
  console.log(`SERVER - CREATECLIP - Request body: ${JSON.stringify(req.body)}`);

  if (!isCreateClipRequestValid(req)) {
    console.error(`SERVER - CREATECLIP - Invalid request`);
    console.error(
      `SERVER - CREATECLIP - Request body: ${JSON.stringify(req.body)}`
    );

    res.status(500).send();
    return;
  }

  const jobId = findAvailableJobId();
  if (jobId === -1) {
    console.error(`SERVER - CREATECLIP - Could not find available job id`);
    console.error(
      `SERVER - CREATECLIP - Request body: ${JSON.stringify(req.body)}`
    );

    res.status(500).send();
    return;
  }
  console.log(`SERVER - CREATECLIP - Create job with id ${jobId}`);
  createJob(jobId);
  console.log(`SERVER - CREATECLIP - Job created with id ${jobId}`);

  const videoId = getVideoIdByYoutubeUrl(req.body.url);
  const fileName = `${videoPathTemplate}${videoId}${videoFileNameEnding}`;
  const clipName = `${videoPathTemplate}${videoId}${clipFileNameEnding}`;
  const clipFileName = videoId + '_clip.mp4';
  
  const processDownloadVideo = fork('core/downloadVideo.js');
  const processCutVideo = fork('core/cutVideo.js');

  try {
    processDownloadVideo.send({
        url: req.body.url,
        fileName: fileName,
        clipName: clipFileName
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
  } catch (error) {
    console.error("SERVER - CREATECLIP - Error:", error);
    console.error(
      `SERVER - CREATECLIP - Request body: ${JSON.stringify(req.body)}`
    );
    jobQueue[jobId] = { status: jobStatus.ERROR };
    res.status(500).send();
  }
});

const isDownloadRequestValid = (req) => req.query.videoName !== "";
router.get("/download", (req, res) => {
  console.log("SERVER - DOWNLOAD");

  if (!isDownloadRequestValid(req)) {
    return res
      .status(400)
      .send("Invalid download request. Missing or empty videoName parameter.");
  }

  const videoFilePath = path.join(videoPathTemplate, req.query.videoName);
  res.download(videoFilePath, (err) => {
    if (err) {
      console.error("SERVER - DOWNLOAD - Error:", err);
      return res.status(500).send("Error downloading the video.");
    }
  });
});

const isGetVideoDurationRequestValid = (req) => req.query.youtubeUrl !== "";
router.get("/getvideoduration", async (req, res) => {
  console.log("SERVER - GETVIDEODURATION");

  if (!isGetVideoDurationRequestValid(req)) {
    return res
      .status(400)
      .send(
        "Invalid getvideoduration request. Missing or empty youtubeUrl parameter."
      );
  }

  try {
    const duration = await videoprocessing.getVideoDurationAsync(
      req.query.youtubeUrl
    );
    res.status(200).send(duration);
  } catch (error) {
    console.error("SERVER - GETVIDEODURATION - Error:", error);
    res.status(500).send("Error getting video duration.");
  }
});

module.exports = router;
