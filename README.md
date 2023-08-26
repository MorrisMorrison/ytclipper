# ytclipper
Simple web application to create clips from youtube videos and download them.

1. Enter YouTube URL
2. Enter start time
3. Enter end time
4. Download Clip

## Built With
- express.js 
- handlebars
- fluent-ffmpeg
- youtube-dl
- tailwind css
- toastr

## Run locally
### Requirements
- node

### Setup
1. Install the required packages
`npm i`
2. Run the app
`npm run start`

Or run as docker container 
`docker build -t ytclipper .`

### Configuration
- Port can be configured via env variable PORT (default 4001)



## TODO
- [x] input validation
- [x] let users enter the end time instead of duration
- [x] add loading-screen, or some kind of progress indicator
- [x] do video processing with background workers as its CPU heavy
- [x] add dark mode
- [ ] embed video player into the site
- [ ] let users set start and end time using a slider embedded in the video player
