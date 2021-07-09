const youtubedl = require('youtube-dl')
const fs = require('fs')

const downloadVideo = (url) => {
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
        console.log('Finished.')
    })

    return videoName;
}


const cutVideo = (sourceFile, from, to )=>{
    


    return '';
}

module.exports = {
    downloadVideo,
    cutVideo
}