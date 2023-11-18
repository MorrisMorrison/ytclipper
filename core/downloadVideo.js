const videoprocessing = require('./videoprocessing');

process.on('message', async (message) => {
    try {
        console.log(`Downloading video from ${message.url} to ${message.fileName}`);
        const result = await videoprocessing.downloadVideoAsync(message.url, message.fileName, message.videoName);
        console.log('Video download completed successfully.');
        process.send(result);
    } catch (error) {
        console.error('Error during video download:', error);
        process.send({ error: error.message });
    }
});
