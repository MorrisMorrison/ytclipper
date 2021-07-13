const timeObject2Seconds = (time) => (time.hours / 60 / 60) + (time.minutes / 60) + time.seconds;
const isTimeInputValid = (time) => /([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]/g.test(time);
// const isTimeInputValid = (time) => time.match(/^\d?\d(?::\d{2}){2}$/);
const isYoutubeUrlValid = (url) => /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/.test(url);
const getVideoDuration = async (youtubeUrl) =>
    new Promise(resolve => {
        const url = window.location.href + "api/v1/getvideoduration?youtubeUrl=" + youtubeUrl;
        fetch(url, {
            method: 'GET',
        }).then(res => {
            if (res.status = 200) {
                const durationInSeconds = res.text();
                resolve(durationInSeconds);
            }
        });
    });

const isTimestampWithinDuration = (timestamp, duration) => timestamp <= duration;


const getTimeAsObject = (time) => {

    const arr = time.split(':');
    var hours = 0;
    var minutes = 0;
    var seconds = 0;

    switch (arr.length) {
        case 0:
            seconds = arr[0];
            break;
        case 2:
            minutes = arr[0];
            seconds = arr[1];
            break;
        case 3:
            hours = arr[0];
            minutes = arr[1];
            seconds = arr[2];
            break;
    }

    return {
        hours: hours,
        minutes: minutes,
        seconds: seconds
    }
}


const onClipButtonClick = () => {
    const url = window.location.href + 'api/v1/createclip'

    const youtubeUrl = document.getElementById('url').value;
    let from = document.getElementById('from').value;
    let to = document.getElementById('to').value;

    if (url == '' || from == '' || to == '') {
        toastr.error('Please provide a url and both timestamps.', 'Invalid Inout');
        return;
    }

    if (!isTimeInputValid(from) || !isTimeInputValid(to)) {
        toastr.error('Please provide timestamps as HH:MM:SS.', 'Invalid Format');
        return;
    }

    if(!isYoutubeUrlValid(youtubeUrl)){
        toastr.error('Please provide a valid youtube url.', 'Invalid Url')
        return;
    }

    getVideoDuration(youtubeUrl).then(videoDuration => {
        from = timeObject2Seconds(getTimeAsObject(from));
        to = timeObject2Seconds(getTimeAsObject(to));

        if (!isTimestampWithinDuration(parseInt(from), videoDuration) || !isTimestampWithinDuration(parseInt(to), videoDuration)) {
            toastr.error('Please use timestamps that are within the videos duration.', 'Invalid Timestamps.');
            return;
        }
        toastr.success('The download will pop up automatically. This may take a few seconds.', "Download Started.");

        const duration = to - from;

        const payload = JSON.stringify({
            url: youtubeUrl,
            from: from,
            to: duration,
        });

        const headers = {
            'content-type': 'application/json'
        };

        fetch(url, {
            method: 'POST',
            headers: headers,
            body: payload,
        }).then(
            response => {
                switch (response.status) {
                    case 200:
                        const videoName = response.text();
                        videoName.then(resolve => {
                            window.open('/api/v1/download?videoName=' + resolve);
                        });
                        break;
                    case 500:
                        toastr.error('Timestamps are not within video length.');
                }
            }
        ).then(
            html => console.log(html)
        );
    });
}

const downloadVideo = (videoName) => {
    const url = window.location.href + 'api/v1/download?videoName=' + videoName;
    fetch(url, {
        method: 'GET',
    }).then(res => {
        if (res.status == 200) {
        }
    });
}

const resetInputValues = () => {
    document.getElementById('url').value = '';
    document.getElementById('from').value = '';
    document.getElementById('to').value = '';
}