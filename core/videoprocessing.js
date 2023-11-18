const youtubedl = require("youtube-dl-exec");
const ffmpeg = require("fluent-ffmpeg");

const getVideoDurationAsync = (url) =>
youtubedl(url, {
    noWarnings: true,
    skipDownload: true,
    getDuration: true,
  });

const downloadVideoAsync = (url, videoPath, videoName) =>
  new Promise((resolve) => {
    youtubedl(url,{output: videoPath, format: "mp4", downloadSections: "*1-45"}).then(res => {console.log(res);resolve(videoName)});
  });

const cutVideoAsync = (fileName, clipName, from, to) =>
  new Promise((resolve) => {
    ffmpeg(fileName)
      .seekInput(from)
      .withDuration(to)
      .on("end", function () {
        resolve(clipName);
      })
      .on("error", (error) => {
        console.log(
          "SERVER - CUTVIDEOASYNC - Error occurred while cutting video: "
        );
        console.log(error);
      })
      .save(clipName);
  });

module.exports = {
  cutVideoAsync,
  downloadVideoAsync,
  getVideoDurationAsync,
};
