const videoprocessing = require('./videoprocessing');

process.on('message', async(message) => {
    const result = await videoprocessing.cutVideoAsync(message.fileName, message.clipName, message.from, message.to);
    process.send(result);
})
