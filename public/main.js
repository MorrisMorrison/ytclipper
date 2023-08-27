const timeObject2Seconds = (time) => (time.hours * 60 * 60) + (time.minutes * 60) + time.seconds;
const isTimeInputValid = (time) => /([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]/g.test(time);
const isYoutubeUrlValid = (url) => /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/.test(url);
const isTimestampWithinDuration = (timestamp, duration) => timestamp <= duration;

const getTimeAsObject = (time) => {
    const [hours = 0, minutes = 0, seconds = 0] = time.split(':').map(Number);
    return {
        hours,
        minutes,
        seconds
    };
};

const enableProgressBar = () => {
    const progressBarWrapper = document.getElementById("progressBarWrapper");
    // progressBarWrapper.classList.remove("invisible");
    const progress = document.createElement('div');
    progress.id =  'progress';
    progress.classList.add('progress');
    const progressBar = document.createElement('div');
    progressBar.id = 'progressBar';
    progressBar.classList.add('progress-bar-custom');
    progressBar.classList.add('bg-green-500');
    progress.appendChild(progressBar);
    progressBarWrapper.appendChild(progress);
}

const disableProgressBar = () => {
    const progressBarWrapper = document.getElementById("progressBarWrapper");
    const progress = document.getElementById("progress");
    // progressBarWrapper.classList.add("invisible");
    progressBarWrapper.removeChild(progress);
}

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
        videoDuration = timeObject2Seconds(getTimeAsObject(videoDuration));

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
                        enableProgressBar();

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

const getJobStatus = (jobId) => {
    const url = window.location.href + 'api/v1/getjobstatus?jobId=' + jobId;
    fetch(url, {
        method: 'GET',
    }).then(res => {
        switch (res.status) {
            case 200:
                res.text().then(result => {
                    disableProgressBar();
                    window.open('/api/v1/download?videoName=' + result);
                })
                break;
            case 201:
                console.log("AGAIN")
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


const handleDarkMode = () => {
    console.log(localStorage.theme);
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
