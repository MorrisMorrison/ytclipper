const jobStatus = {
  RUNNING: "running",
  DONE: "done",
  ERROR: "error",
  TIMEOUT: "timeout",
  CREATED: "created",
};

const MAX_JOBS_COUNT = 10;
const jobStateManager = new Array(MAX_JOBS_COUNT).fill(null);

const findAvailableJobId = () => {
  const availableJobIndex = jobStateManager.findIndex(
    (job) =>
      !job ||
      job.status === jobStatus.ERROR ||
      job.status === jobStatus.TIMEOUT ||
      job.status === jobStatus.DONE
  );
  return availableJobIndex !== -1 ? availableJobIndex : -1;
};

const handleJobStatus = (res, jobId) => {
  const job = jobStateManager[jobId];

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
  jobStateManager[jobId] = { status: jobStatus.CREATED };
};
// TODO: Track created and finished time to be able to remove jobs after 1 minute
const finishJob = (jobId, clipName) => {
  jobStateManager[jobId] = { status: jobStatus.DONE, clipName };
};

const failJob = (jobId, error) => {
  jobStateManager[jobId] = { status: jobStatus.ERROR, error };
};

const removeJob = (jobId) => {
  jobStateManager[jobId] = null;
};

module.exports = {
    createJob,
    handleJobStatus,
    findAvailableJobId,
    finishJob,
    removeJob,
    failJob
  };