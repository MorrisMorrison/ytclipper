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

    if (!isYoutubeUrlValid(youtubeUrl)) {
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
                    case 201:
                        toastr.success('The download will pop up automatically. This may take a few seconds.', "Download Started.");
                        const progressBarWrapper = document.getElementById("progressBarWrapper");
                        progressBarWrapper.classList.remove("invisible");

                        const jobId = response.text();
                        jobId.then(jId => {
                            getJobStatus(jId);
                        });
                        break;
                    case 500:
                        toastr.error('Timestamps are not within video length.');
                        break;

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

const getJobStatus = (jobId) => {
    const url = window.location.href + 'api/v1/getjobstatus?jobId=' + jobId;
    fetch(url, {
        method: 'GET',
    }).then(res => {
        switch (res.status) {
            case 200:
                res.text().then(result => {
                    const progressBarWrapper = document.getElementById("progressBarWrapper");
                    progressBarWrapper.classList.add("invisible");
                    window.open('/api/v1/download?videoName=' + result);
                })
                break;
            case 201:
                setTimeout(() => getJobStatus(jobId), 2000);
                break;
            case 400:
                toastr.error('An error occurred when getting the job status. Please try again in a few minutes or use the contact form.', 'Get Job Status')
                break;
            case 408:
                toastr.error('A timeout occurred when getting the job status. Please try again in a few minutes or use the contact form.', 'Get Job Status')
                break;
        }

    });


}
const resetInputValues = () => {
    document.getElementById('url').value = '';
    document.getElementById('from').value = '';
    document.getElementById('to').value = '';
}


const handleDarkMode = () => {
    console.log(localStorage.theme);
    // On page load or when changing themes, best to add inline in `head` to avoid FOUC
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark')
    } else {
        document.documentElement.classList.remove('dark')
    }
}

const setTheme = ()=> {
    if (localStorage.theme === 'dark'){
        localStorage.theme = 'light'
    }
    else if(localStorage.theme === 'light'){
        localStorage.theme = 'dark'
    }

    handleDarkMode();
}

window.onload = () => {
    localStorage.theme = 'dark';
    handleDarkMode();
}
