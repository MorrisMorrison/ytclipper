const timeObject2Seconds = (time) =>  (time.hours / 60 / 60) + (time.minutes /60) + time.seconds;
const isTimeInputValid = (time) => /([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]/g.test(time);
// const isTimeInputValid = (time) => time.match(/^\d?\d(?::\d{2}){2}$/);
const isYoutubeUrlValid = (url) => new RegExp("/http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/").test(url);
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
    const url = 'http://localhost:4001/api/v1/createclip'

    const youtubeUrl = document.getElementById('url').value;
    let from = document.getElementById('from').value;
    let to = document.getElementById('to').value;

    if (url == '' || from == '' || to == '') {
        toastr.error('Please provide a url and both timestamps.');
        return;
    }

    if (!isTimeInputValid(from) || !isTimeInputValid(to)) {
        toastr.error('Please provide timestamps as HH:MM:SS.');
        return;
    }


    from = timeObject2Seconds(getTimeAsObject(from));
    to = timeObject2Seconds(getTimeAsObject(to));
    const duration = to - from;

    console.log(from);
    console.log(to);
    console.log(duration);

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
            toastr.success('Started creating clip.');
            if (response.status == 200) {
                console.log('CLIENT -- SUCCESS!')
                const videoName = response.text();
                console.log('CLIENT -- VIDEO NAME: ' + videoName);
                videoName.then(resolve => {
                    console.log('RESOLVED VIDEO NAME: ' + resolve)
                    window.open('/api/v1/download?videoName=' + resolve);
                })
            }
        }
    ).then(
        html => console.log(html)
    );
}

const downloadVideo = (videoName) => {
    const url = 'http://localhost:4001/api/v1/download?videoName=' + videoName;
    fetch(url, {
        method: 'GET',
    }).then(res => {
        if (res.status == 200) {
            console.log('CLIENT -- DOWNLOAD VIDEO');
            console.log('CLIENT -- DOWNLOAD VIDEO URL: ' + url);
        }
    });
}

const resetInputValues = () => {
    document.getElementById('url').value = '';
    document.getElementById('from').value = '';
    document.getElementById('to').value = '';
}