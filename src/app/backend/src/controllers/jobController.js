const jobs = require('../queries/jobs');
const { createError } = require('../utils/errors');

async function createJob(req, res) {
  if (req.body.budgetType === 'FIXED' && !req.body.fixedBudget) throw createError('Fixed budget is required', 400);
  if (req.body.budgetType === 'HOURLY' && !req.body.hourlyRate) throw createError('Hourly rate is required', 400);
  const job = await jobs.createJob(req.user.id, req.body);
  res.status(201).json({ message: 'Job posted successfully', job });
}

async function listJobs(req, res) {
  const result = await jobs.listJobs(req.query);
  res.json({
    message: 'Jobs retrieved successfully',
    jobs: result.jobs,
    pagination: { page: result.page, limit: result.limit, total: result.total, pages: Math.ceil(result.total / result.limit) }
  });
}

async function getJob(req, res) {
  const job = await jobs.getJobById(req.params.id);
  if (!job) throw createError('Job not found', 404);
  res.json({ message: 'Job retrieved successfully', job });
}

async function updateJob(req, res) {
  const job = await jobs.updateJob(req.params.id, req.user.id, req.body);
  if (!job) throw createError('Job not found or unauthorized', 404);
  res.json({ message: 'Job updated successfully', job });
}

async function deleteJob(req, res) {
  const ok = await jobs.closeJob(req.params.id, req.user.id);
  if (!ok) throw createError('Job not found or unauthorized', 404);
  res.json({ message: 'Job closed successfully' });
}

async function userPostedJobs(req, res) {
  const listed = await jobs.listClientJobs(req.user.id);
  res.json({ message: 'Jobs retrieved successfully', jobs: listed });
}

module.exports = { createJob, listJobs, getJob, updateJob, deleteJob, userPostedJobs };
