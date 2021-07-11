const youtubedl = require('youtube-dl')
const ffmpeg = require('fluent-ffmpeg')
const fs = require('fs')

const downloadVideo = (url, callback) => {
    // download video with ytcore or youtubedl
    console.log('Processing...')
    const video = youtubedl(url);
    const videoName = './videos/myvideo.mp4';

    video.on('info', info => {
        console.log('Download started')
        console.log('filename: ' + info._filename)
        console.log('size: ' + info.size)
    })

    video.pipe(fs.createWriteStream(videoName));

    video.on('end', info => {
        callback.call();
        console.log('Finished.')
    })

    return 12;
}

const downloadVideoAsync = async (url, callback) =>
    new Promise(resolve => {
        // download video with ytcore or youtubedl
        console.log('SERVER -- Processing...')
        const video = youtubedl(url);
        const videoName = 'myvideo.mp4'
        const videoPath = './videos/myvideo.mp4';

        video.on('info', info => {
            console.log('SERVER -- Download started')
            console.log('SERVER -- filename: ' + info._filename)
            console.log('SERVER -- size: ' + info.size)
        })

        video.pipe(fs.createWriteStream(videoPath));

        video.on('end', info => {
            callback.call().then(() => {
                console.log('SERVER -- DOWNLOAD VIDEO ASYNC');
                resolve(videoName);
            });
        })
    }
    );

const cutVideo = (sourceFile, from, to) => {
    var command = ffmpeg(sourceFile).seekInput(from).withDuration(to)
        .on('end', function () {
            console.log('SERVER -- FINISHED CUTTING !');
        })
        .save('./videos/myclip.mp4');
}


const cutVideoAsync = async (sourceFile, from, to) => 
    new Promise(resolve => {
        var command = ffmpeg(sourceFile).seekInput(from).withDuration(to)
        .on('end', function () {
            console.log('SERVER -- FINISHED CUTTING !');
            resolve();
        })
        .save('./videos/myclip.mp4');
    })
    



module.exports = {
    cutVideoAsync,
    downloadVideoAsync,
    downloadVideo,
    cutVideo
}