# ytclipper
Simple web application to create clips from youtube videos and download them.


https://github.com/MorrisMorrison/ytclipper/assets/22982151/bc950608-114f-4d10-b9cd-e46c5cf37333


1. Enter YouTube URL
2. Enter start time (HH:MM:SS)
3. Enter end time (HH:MM:SS)
4. Download Clip


## Built With
- express.js 
- yt-dlp
- ffmpeg
- tailwind css
- video.js
- toastr

## Run locally
### Requirements
- node
- python3
- python3-pip
- python3-certifi
- ffmpeg

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
- [x] prevent click spamming
- [x] automatically delete downloaded videos
- [x] use yt-dlp to directly download a section of a video
- [ ] track created/finished time of jobs
- [ ] kill suspended jobs after a specified timeout
- [ ] rewrite everything in go
