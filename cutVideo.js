const videoprocessing = require('./videoprocessing');

process.on('message', async(message) => {
    console.log('CUTCUTCUTCUTCUT')
    const result = await videoprocessing.cutVideoAsync(message.fileName, message.clipName, message.from, message.to);
    console.log("CUTCUTCUTCUTRESULT " + result)
    process.send(result);
})
