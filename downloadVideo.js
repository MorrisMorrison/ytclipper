const videoprocessing = require('./videoprocessing');

process.on('message', async(message) => {
    const result = await videoprocessing.downloadVideoAsync(message.url, message.fileName, message.videoName);
    process.send(result);
})