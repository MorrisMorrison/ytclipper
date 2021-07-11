const onClipButtonClick = () => {
    const url = 'http://localhost:4001/api/v1/createclip'
    const payload = JSON.stringify({
        url: document.getElementById('url').value,
        from: document.getElementById('from').value,
        to: document.getElementById('to').value,
    });

    const headers = {
        'content-type': 'application/json'
    };

    console.log(payload);

    fetch(url, {
        method: 'POST',
        headers: headers,
        body: payload,
    }).then(
        // wartedialog anzeigen
        // status abfragen
        response => {
            if (response.status == 200) {
                console.log('CLIENT -- SUCCESS!')
                const videoName = response.text();
                console.log('CLIENT -- VIDEO NAME: ' + videoName);
                videoName.then(resolve => {
                    console.log('RESOLVED VIDEO NAME: ' + resolve)
                    window.open('/api/v1/download?videoName='+ resolve);
                    // downloadVideo(resolve);
                })
            }
        }
    ).then(
        html => console.log(html)
    );
}

const showWaitingDialog = () => {

}
const removeWaitingDialog = () => {

}


const downloadVideo = (videoName) => {
    const url = 'http://localhost:4001/api/v1/download?videoName=' + videoName;
    fetch(url, {
        method: 'GET',
    }).then(res => {
        if (res.status == 200){
            console.log('CLIENT -- DOWNLOAD VIDEO');
            console.log('CLIENT -- DOWNLOAD VIDEO URL: ' + url);
        }
    });
}