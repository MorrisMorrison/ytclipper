const getVideoDuration = async (youtubeUrl) => {
  const url =
    window.location.href + "api/v1/video/duration?youtubeUrl=" + youtubeUrl;
  try {
    const res = await fetch(url, { method: "GET" });
    if (res.status === 200) {
      const durationInSeconds = await res.text();
      return durationInSeconds;
    }
  } catch (error) {
    console.error(
      "CLIENT - GETJOBSTATUS - Error fetching video duration:",
      error
    );
    enableClipButton();
  }
};

const onClipButtonClick = async () => {
  disableClipButton();
  hideDownloadLink();

  const url = window.location.href + "api/v1/clip";
  const youtubeUrl = getUrlInput();
  let from = document.getElementById("from").value;
  let to = document.getElementById("to").value;

  if (url === "" || from === "" || to === "") {
    toastr.error("Please provide a URL and both timestamps.", "Invalid Input");
    enableClipButton();
    return;
  }

  if (!isTimeInputValid(from) || !isTimeInputValid(to)) {
    toastr.error("Please provide timestamps as HH:MM:SS.", "Invalid Format");
    enableClipButton();
    return;
  }

  if (!isYoutubeUrlValid(youtubeUrl)) {
    toastr.error("Please provide a valid YouTube URL.", "Invalid Url");
    enableClipButton();
    return;
  }

  try {
    const videoDuration = await getVideoDuration(youtubeUrl);
    const fromInSeconds = convertToSeconds(from);
    const toInSeconds = convertToSeconds(to);
    const durationInSeconds = convertToSeconds(videoDuration);

    if (
      !isTimestampWithinDuration(fromInSeconds, durationInSeconds) ||
      !isTimestampWithinDuration(toInSeconds, durationInSeconds)
    ) {
      toastr.error(
        "Please use timestamps that are within the video's duration.",
        "Invalid Timestamps"
      );

      enableClipButton();
      return;
    }

    const payload = JSON.stringify({
      url: youtubeUrl,
      from: from,
      to: to,
    });

    const headers = {
      "content-type": "application/json",
    };

    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: payload,
    });

    switch (response.status) {
      case 201:
        toastr.success(
          "The download will pop up automatically. This may take a few seconds.",
          "Download Started"
        );
        showProgressBar();
        const jobId = await response.text();
        getJobStatus(jobId);
        break;
      case 500:
        toastr.error("Timestamps are not within video length.");
        break;
    }
  } catch (error) {
    console.error("CLIENT - GETJOBSTATUS - An error occurred:", error);
    enableClipButton();
  }
};

const getJobStatus = async (jobId) => {
  const url = window.location.href + "api/v1/jobs/status?jobId=" + jobId;

  try {
    const res = await fetch(url, { method: "GET" });

    switch (res.status) {
      case 200:
        const result = await res.text();
        hideProgressBar();
        const downloadUrl = "/api/v1/clip?videoName=" + result;
        showDownloadLink(downloadUrl);
        window.open(downloadUrl);
        enableClipButton();
        break;
      case 201:
        setTimeout(() => getJobStatus(jobId), 2000);
        break;
      case 408:
        toastr.error(
          "The download timed out. Please try again in a few minutes or use the contact form.",
          "Download Timeout"
        );
        enableClipButton();
        break;
      case 500:
        toastr.error(
          "An error occurred when downloading the clip. Please try again in a few minutes or use the contact form.",
          "Download Error"
        );
        enableClipButton();
        break;
      default:
        toastr.error(
          "An error occurred when retrieving the job status. Please try again in a few minutes or use the contact form.",
          "Unknown Error"
        );
        enableClipButton();
        break;
    }
  } catch (error) {
    console.error("CLIENT - GETJOBSTATUS - An error occurred:", error);
    enableClipButton();
  }
};

const onPreviewButtonClick = () => {
  const url = getUrlInput();
  if (!isYoutubeUrlValid(url)) {
    toastr.error("Please provide a valid YouTube URL.", "Invalid Url");
    return;
  }

  if (isVideoPlayerVisible()) {
    hideVideoPlayer();
  } else {
    showVideoPlayer();
  }
};

const getUrlInput = () => document.getElementById("url").value;

const showProgressBar = () =>
  document.getElementById("progressBarWrapper").classList.remove("hidden");
const hideProgressBar = () =>
  document.getElementById("progressBarWrapper").classList.add("hidden");

const enableClipButton = () =>
  (document.getElementById("clipButton").disabled = false);
const disableClipButton = () =>
  (document.getElementById("clipButton").disabled = true);

const showVideoPlayer = () => {
  const player = videojs("video-player", {
    techOrder: ["youtube"],
    sources: [
      {
        type: "video/youtube",
        src: getUrlInput(),
      },
    ],
  });

  document.getElementById("video-player-wrapper").classList.remove("hidden");
};
const hideVideoPlayer = () =>
  document.getElementById("video-player").classList.add("hidden");
const isVideoPlayerVisible = () =>
  !document.getElementById("video-player").classList.contains("hidden");

const showDownloadLink = (downloadUrl) => {
  const downloadLinkUrlWrapper = document.getElementById("downloadLinkWrapper");
  const downloadLink = document.getElementById("downloadLink");
  downloadLink.setAttribute("href", downloadUrl);
  downloadLinkUrlWrapper.classList.remove("hidden");
};
const hideDownloadLink = () =>
  document.getElementById("downloadLinkWrapper").classList.add("hidden");

const handleDarkMode = () => {
  if (
    localStorage.theme === "dark" ||
    (!("theme" in localStorage) &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

const setTheme = () => {
  localStorage.theme = localStorage.theme === "dark" ? "light" : "dark";
  handleDarkMode();
};

window.onload = () => {
  localStorage.theme = "dark";
  handleDarkMode();
};
