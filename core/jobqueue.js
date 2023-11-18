const jobStatus = {
  RUNNING: "running",
  DONE: "done",
  ERROR: "error",
  TIMEOUT: "timeout",
  CREATED: "created",
};

const JOB_QUEUE_SIZE = 10;
const jobQueue = new Array(JOB_QUEUE_SIZE).fill(null);

const findAvailableJobId = () => {
  const availableJobIndex = jobQueue.findIndex(
    (job) =>
      !job ||
      job.status === jobStatus.DONE ||
      job.status === jobStatus.ERROR ||
      job.status === jobStatus.TIMEOUT
  );
  return availableJobIndex !== -1 ? availableJobIndex : -1;
};

const handleJobStatus = (res, jobId) => {
  const job = jobQueue[jobId];

  if (!job) {
    res.status(400).send();
    return;
  }

  switch (job.status) {
    case jobStatus.CREATED:
    case jobStatus.RUNNING:
      res.status(201).send();
      break;
    case jobStatus.DONE:
      res.status(200).send(job.clipName);
      break;
    case jobStatus.TIMEOUT:
      res.status(408).send();
      break;
    case jobStatus.ERROR:
      res.status(500).send();
      break;
    default:
      res.status(400).send();
  }
};

const createJob = (jobId) => {
  jobQueue[jobId] = { status: jobStatus.CREATED };
};

const finishJob = (jobId, clipName) => {
  jobQueue[jobId] = { status: jobStatus.DONE, clipName };
};

const removeJob = (jobId) => {
  jobQueue[jobId] = null;
};

module.exports = {
    createJob,
    handleJobStatus,
    findAvailableJobId,
    finishJob,
    removeJob
  };