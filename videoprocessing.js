const youtubedl = require('youtube-dl')
const ffmpeg = require('fluent-ffmpeg')
const fs = require('fs')

const getVideoDurationAsync = (url) => new Promise(resolve => {
    youtubedl.getInfo(url, (err, info) => {
        'use strict'
        if (err) {
            throw err
        }
        resolve(info.duration);
    })
})


const downloadVideoAsync = (url, videoPath, videoName) =>
    new Promise(resolve => {
            const video = youtubedl(url);

            video.on('info', info => {
                console.log('SERVER - DOWNLOADVIDEOASYNC - Download started')
                console.log('SERVER - DOWNLOADVIDEOASYNC - Download filename: ' + info._filename)
                console.log('SERVER - DOWNLOADVIDEOASYNC - Download size: ' + info.size)
            })

            console.log('SERVER - DOWNLOADVIDEOASYNC - Create filestream to: ' + videoPath);
            video.pipe(fs.createWriteStream(videoPath));

            video.on('end', info => {
                console.log('SERVER - DOWNLOADVIDEOASYNC - Downloading video finished');
                resolve(videoName);
            })

        video.on('error', error => {
            console.log('SERVER - DOWNLOADVIDEOASYNC - Error occurred while downloading video: ');
            console.log(error)
        })
        }
    );

const cutVideoAsync = (fileName, clipName, from, to) =>
    new Promise(resolve => {
        ffmpeg(fileName).seekInput(from).withDuration(to)
            .on('end', function () {
                resolve(clipName);
            })
            .on('error', (error) => {
                console.log('SERVER - CUTVIDEOASYNC - Error occurred while cutting video: ');
                console.log(error)
            })
            .save(clipName);
    })


module.exports = {
    cutVideoAsync,
    downloadVideoAsync,
    getVideoDurationAsync
}