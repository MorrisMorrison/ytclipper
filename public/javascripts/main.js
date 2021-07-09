const onClipButtonClick = () => {
    const url = 'http://localhost:4001/api/v1/createclip'
    const payload = JSON.stringify({
        url: document.getElementById('url').value,
        from: document.getElementById('from').value,
        to: document.getElementById('to').value,
    });

    const headers ={
        'content-type': 'application/json'
    };

    console.log(payload);

    fetch(url, {
        method: 'POST',
        headers: headers,
        body: payload 
    }).then(
        response => response.text()
    ).then(
        html => console.log(html)
    );
}