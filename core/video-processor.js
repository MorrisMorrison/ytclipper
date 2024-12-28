const youtubedl = require("youtube-dl-exec");

const getVideoDurationAsync = (url) =>
  youtubedl(url, {
    noWarnings: true,
    skipDownload: true,
    getDuration: true,
  });

// available video formats yt-dlp --list-formats {url}
// 18  mp4   640x360     30  2 │ ≈ 11.24MiB  282k https │ avc1.42001E         mp4a.40.2       44k [en] 360p
const downloadVideoAsync = (url, videoPath, videoName, from, to, jobId) =>
  new Promise((resolve, reject) => {
    const downloaderArgs = `ffmpeg_i:-ss ${from} -to ${to}`;
    youtubedl(url, {
      output: videoPath,
      format: "136",
      downloader: "ffmpeg",
      downloaderArgs: downloaderArgs,
    })
      .then((res) => {
        console.log("SERVER - DOWNLOADVIDEOASYNC - youtubedl download successful.")
        console.log(res);
        resolve(videoName);
      })
      .catch((error) => {
        console.error(
          `SERVER - DOWNLOADVIDEOASYNC - Error downloading video for jobId ${jobId}:`,
          error
        );
        reject(error);
      });
  });

module.exports = {
  downloadVideoAsync,
  getVideoDurationAsync,
};
