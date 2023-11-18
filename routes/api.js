const fs = require("fs");

const express = require("express");
const router = express.Router();
const videoProcessor = require("../core/video-procesor");
const jobStateManager = require("../core/job-state-manager");
const path = require("path");
const { fork } = require("child_process");

const appDir = path.dirname(require.main.filename);
const videoPathTemplate = (appDir + `/videos/`).replace("/bin", "");
const videoFormat = ".mp4";

router.get("/getvideoduration", async (req, res) => {
  console.log(
    "SERVER - GETVIDEODURATION - Request query:" + JSON.stringify(req.query)
  );

  const isGetVideoDurationRequestValid = req.query.youtubeUrl !== "";
  if (!isGetVideoDurationRequestValid) {
    return res
      .status(400)
      .send(
        "Invalid getvideoduration request. Missing or empty youtubeUrl parameter."
      );
  }

  try {
    const duration = await videoProcessor.getVideoDurationAsync(
      req.query.youtubeUrl
    );
    res.status(200).send(duration);
  } catch (error) {
    console.error("SERVER - GETVIDEODURATION - Error:", error);
    res.status(500).send("Error getting video duration.");
  }
});

router.post("/createclip", async (req, res) => {
  console.log("SERVER - CREATECLIP");
  console.log("SERVER - CREATECLIP - Request body:" + JSON.stringify(req.body));
  console.log(
    `SERVER - CREATECLIP - Request body: ${JSON.stringify(req.body)}`
  );

  const isCreateClipRequestValid =
    req.body && req.body.url && isYoutubeUrlValid(req.body.url);
  if (!isCreateClipRequestValid) {
    console.error(`SERVER - CREATECLIP - Invalid request`);
    console.error(
      `SERVER - CREATECLIP - Request body: ${JSON.stringify(req.body)}`
    );

    res.status(500).send();
    return;
  }

  const jobId = jobStateManager.findAvailableJobId();
  if (jobId === -1) {
    console.error(`SERVER - CREATECLIP - Could not find available job id`);
    console.error(
      `SERVER - CREATECLIP - Request body: ${JSON.stringify(req.body)}`
    );

    res.status(500).send();
    return;
  }
  console.log(`SERVER - CREATECLIP - Create job with id ${jobId}`);
  jobStateManager.createJob(jobId);
  console.log(`SERVER - CREATECLIP - Job created with id ${jobId}`);

  const videoId = getVideoIdByYoutubeUrl(req.body.url);
  const fullDownloadVideoName = `${videoPathTemplate}${videoId}${videoFormat}`;
  const clipFileName = videoId + videoFormat;

  const downloadClipHandlerFork = fork("core/download-clip-handler.js");

  try {
    downloadClipHandlerFork.send({
      url: req.body.url,
      fileName: fullDownloadVideoName,
      clipName: clipFileName,
      from: req.body.from,
      to: req.body.to,
      jobId: jobId,
    });

    console.log(
      "SERVER - CREATECLIP - Downloading video in child process started"
    );
    console.log(
      "SERVER - CREATECLIP - Downloading video from url: " + req.body.url
    );
    console.log(
      "SERVER - CREATECLIP - Saving downloaded video in: " +
        fullDownloadVideoName
    );

    downloadClipHandlerFork.on("message", async (result) => {
      if (result.error) {
        console.error(
          `SERVER - CREATECLIP - Error downloading clip: ${clipFileName} - jobId: ${jobId}`,
          result.error
        );
        jobStateManager.failJob(jobId);
        return;
      }

      console.log("SERVER - CREATECLIP - Downloading clip finished");
      jobStateManager.finishJob(jobId, clipFileName);
    });

    res.status(201).send(JSON.stringify(jobId));
  } catch (error) {
    console.error("SERVER - CREATECLIP - Error:", error);
    console.error(
      `SERVER - CREATECLIP - Request body: ${JSON.stringify(req.body)}`
    );
    jobStateManager.failJob(jobId);
    deleteFile(fullDownloadVideoName);
    res.status(500).send();
  }
});

router.get("/download", (req, res) => {
  console.log("SERVER - DOWNLOAD - Request query:" + JSON.stringify(req.query));

  const isDownloadRequestValid = req.query.videoName !== "";
  if (!isDownloadRequestValid) {
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
    deleteFile(videoFilePath);
  });
});

router.get("/getjobstatus", (req, res) => {
  console.log(
    "SERVER - GETJOBSTATUS - Request query:" + JSON.stringify(req.query)
  );
  const isRequestValid = req.query.jobId !== "";
  if (!isRequestValid) {
    return res
      .status(400)
      .send("Invalid getjobstatus request. Missing or empty jobId parameter.");
  }
  const jobId = req.query.jobId;

  jobStateManager.handleJobStatus(res, jobId);
});

const isYoutubeUrlValid = (url) =>
  /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/.test(
    url
  );

const getVideoIdByYoutubeUrl = (url) => {
  const regExp =
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[7] && match[7].length === 11 ? match[7] : false;
};

const deleteFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    console.log(`SERVER - DELETEFILE - File does not exists: ${filePath}`);
    return;
  }
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(`SERVER - DELETE FILE - Error deleting file: ${err}`);
    } else {
      console.log(
        `SERVER - DELETE FILE - File deleted successfully: ${filePath}`
      );
    }
  });
};

module.exports = router;
