# ytclipper
Simple web application to create clips from youtube videos and download them.
The goal of this project is to play around with unknown technologies.

1. Enter YouTube URL
2. Enter start time (HH:MM:SS)
3. Enter end time (HH:MM:SS)
4. Download Clip

Downloading the clip might take a while depending on the video, as we still download the whole video and then cut it with ffmpeg afterwards.

## Built With
- express.js 
- fluent-ffmpeg
- yt-dlp
- tailwind css
- video.js
- toastr

## Run locally
### Requirements
- node
- python3
- ffmpeg
- certifi?

### Setup
1. Install the required packages
`npm i`
2. Run the app
`npm run start`

Or run as docker container 
`docker build -t ytclipper .`
`docker run -d -e PORT=4001 -p 8080:4001 ytclipper`

### Configuration
- Port can be configured via env variable PORT (default 4001)

## TODO
- [x] input validation
- [x] let users enter the end time instead of duration
- [x] add loading-screen, or some kind of progress indicator
- [x] do video processing async with background workers
- [x] add dark mode
- [x] embed video player into the site
- [x] migrate to yt-dlp from youtube-dl
- [ ] let users set start and end time using a slider embedded in the video player
- [ ] prevent click spamming
- [ ] automatically delete downloaded videos
- [x] use yt-dlp to directly cut videos instead of downloading the whole video and then cutting it with ffmpeg manually
- [ ] rewrite in go
