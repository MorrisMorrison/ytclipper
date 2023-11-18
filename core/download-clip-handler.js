const videoprocessing = require("./video-procesor");
const jobStateManager = require("./job-state-manager");

process.on("message", async (message) => {
  try {
    console.log(
      `SERVER - DOWNLOADCLIPHANDLER - Downloading clip from ${message.url} to ${message.clipName}`
    );
    console.log(
      `SERVER - DOWNLOADCLIPHANDLER - Cut video from ${message.from} to ${message.to}`
    );

    const result = await videoprocessing.downloadVideoAsync(
      message.url,
      message.fileName,
      message.clipName,
      message.from,
      message.to,
      message.jobId
    );

    console.log(
      "SERVER - DOWNLOADCLIPHANDLER - Clip download completed successfully."
    );
    process.send(result);
  } catch (error) {
    console.error(
      `SERVER - DOWNLOADCLIPHANDLER - Error downloading clip: ${message.clipName} - jobId: ${message.jobId}`,
      error
    );
    process.send({ error: error.message });
  }
});
