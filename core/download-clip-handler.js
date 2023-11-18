const videoprocessing = require("./video-procesor");

process.on("message", async (message) => {
  try {
    console.log(`Downloading clip from ${message.url} to ${message.clipName}`);;
    console.log(`Cut video from ${message.from} to ${message.to}`);
    
    const result = await videoprocessing.downloadVideoAsync(
      message.url,
      message.fileName,
      message.clipName,
      message.from,
      message.to
    );

    console.log("Clip download completed successfully.");
    process.send(result);
  } catch (error) {
    console.error("Error during video download:", error);
    process.send({ error: error.message });
  }
});
