const timeObjectToSeconds = (time) =>
  time.hours * 60 * 60 + time.minutes * 60 + time.seconds;
const isTimeInputValid = (time) =>
  /([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]/g.test(time);
const isYoutubeUrlValid = (url) =>
  /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/.test(
    url
  );
const isTimestampWithinDuration = (timestamp, duration) =>
  timestamp <= duration;
const getTimeAsObject = (time) => {
  const [hours = 0, minutes = 0, seconds = 0] = time.split(":").map(Number);
  return { hours, minutes, seconds };
};
const convertToSeconds = (timeString) =>
  timeObjectToSeconds(getTimeAsObject(timeString));
