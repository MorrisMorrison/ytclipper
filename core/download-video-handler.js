const videoprocessing = require('./video-procesor');

process.on('message', async (message) => {
    try {
        console.log(`Downloading video from ${message.url} to ${message.clipName}`);
        const result = await videoprocessing.downloadVideoAsync(message.url, message.fileName, message.clipName);
        console.log('Video download completed successfully.');
        process.send(result);
    } catch (error) {
        console.error('Error during video download:', error);
        process.send({ error: error.message });
    }
});
