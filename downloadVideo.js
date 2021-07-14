const videoprocessing = require('./videoprocessing');

process.on('message', async(message) => {
    console.log('DINGDINGDINGDING')
    const result = await videoprocessing.downloadVideoAsync(message.url, message.fileName, message.videoName);
    console.log("DINGDINGDING RESZT" + result);
    process.send(result);
})

// const downloadVideoAsync = async (url, videoPath, videoName) =>
//     new Promise(resolve => {
//             const video = youtubedl(url);
//
//             video.on('info', info => {
//                 console.log('SERVER -- Download started')
//                 console.log('SERVER -- filename: ' + info._filename)
//                 console.log('SERVER -- size: ' + info.size)
//             })
//
//             video.pipe(fs.createWriteStream(videoPath));
//
//             video.on('end', info => {
//                 resolve(videoName);
//             })
//         }
//     );

// module.exports = {
//     downloadVideoAsync,
// }

