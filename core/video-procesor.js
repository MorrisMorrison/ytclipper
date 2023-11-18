const youtubedl = require("youtube-dl-exec");
const ffmpeg = require("fluent-ffmpeg");

const getVideoDurationAsync = (url) =>
  youtubedl(url, {
    noWarnings: true,
    skipDownload: true,
    getDuration: true,
  });

const downloadVideoAsync = (url, videoPath, clipName) =>
  new Promise((resolve) => {
    youtubedl(url, { output: videoPath, format: "mp4" }).then(_ => {
      resolve(clipName);
    });
  });

const cutVideoAsync = (fileName, clipName, from, to) =>
  new Promise((resolve) => {
    ffmpeg(fileName)
      .seekInput(from)
      .withDuration(to)
      .on("end", function () {
        resolve(clipName);
      })
      .on("error", (error, stdout, stderr) => {
        console.error(
          "SERVER - CUTVIDEOASYNC - Error occurred while cutting video: "
        );
        console.error(error);
        console.error(stdout);
        console.error(stderr);
      })
      .save(clipName);
  });

module.exports = {
  cutVideoAsync,
  downloadVideoAsync,
  getVideoDurationAsync,
};
