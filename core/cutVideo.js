const videoprocessing = require("./videoprocessing");

process.on("message", async (message) => {
  try {
    console.log("CUTVIDEOASYNC - Cut video " + message.fileName);
    const result = await videoprocessing.cutVideoAsync(
      message.fileName,
      message.clipName,
      message.from,
      message.to
    );
    process.send(result);
  } catch (error) {
    console.error("CUTVIDEOASYNC - Error processing video: ", error.message);
    process.send({ error: error.message });
  }
});
