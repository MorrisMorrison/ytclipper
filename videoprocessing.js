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
                console.log('SERVER -- Download started')
                console.log('SERVER -- filename: ' + info._filename)
                console.log('SERVER -- size: ' + info.size)
            })

            video.pipe(fs.createWriteStream(videoPath));

            video.on('end', info => {
                resolve(videoName);
            })
        }
    );

const cutVideoAsync = (fileName, clipName, from, to) =>
    new Promise(resolve => {
        ffmpeg(fileName).seekInput(from).withDuration(to)
            .on('end', function () {
                resolve(clipName);
            })
            .save(clipName);
    })


module.exports = {
    cutVideoAsync,
    downloadVideoAsync,
    getVideoDurationAsync
}