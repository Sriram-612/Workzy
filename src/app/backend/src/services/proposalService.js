const { query, withTransaction } = require('../database/db');
const { createError } = require('../utils/errors');
const { createNotification } = require('./notificationService');

function mapProposal(row) {
  return row && {
    id: row.id,
    jobId: row.job_id,
    freelancerId: row.freelancer_id,
    coverLetter: row.cover_letter,
    proposedBudget: Number(row.proposed_budget),
    timeline: row.timeline,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    freelancer: row.freelancer_name ? {
      id: row.freelancer_id,
      name: row.freelancer_name,
      avatar: row.freelancer_avatar,
      skills: row.freelancer_skills || [],
      rating: Number(row.freelancer_rating || 0)
    } : undefined
  };
}

async function createProposal(userId, data) {
  const jobResult = await query('select id, client_id, status, title from jobs where id = $1', [data.jobId]);
  const job = jobResult.rows[0];
  if (!job) throw createError('Job not found', 404);
  if (job.status !== 'ACTIVE') throw createError('Job is not accepting proposals', 400);
  if (job.client_id === userId) throw createError('You cannot apply to your own job', 400);

  const result = await query(
    `insert into proposals (job_id, freelancer_id, cover_letter, proposed_budget, timeline)
     values ($1,$2,$3,$4,$5) returning *`,
    [data.jobId, userId, data.coverLetter, data.proposedBudget, data.timeline]
  ).catch((error) => {
    if (error.code === '23505') throw createError('You have already submitted a proposal for this job', 409);
    throw error;
  });
  await createNotification(null, {
    userId: job.client_id,
    title: 'New Proposal Received',
    message: `You received a new proposal for "${job.title}".`,
    type: 'proposal_received',
    data: { proposalId: result.rows[0].id, jobId: job.id }
  });
  return mapProposal(result.rows[0]);
}

async function listJobProposals(jobId, requesterId) {
  const owner = await query('select client_id from jobs where id = $1', [jobId]);
  if (!owner.rowCount) throw createError('Job not found', 404);
  if (owner.rows[0].client_id !== requesterId) throw createError('Unauthorized to view proposals for this job', 403);
  const result = await query(
    `select p.*, u.name freelancer_name, u.avatar freelancer_avatar, u.skills freelancer_skills, u.rating freelancer_rating
     from proposals p join users u on u.id = p.freelancer_id
     where p.job_id = $1 order by p.created_at desc`,
    [jobId]
  );
  return result.rows.map(mapProposal);
}

async function listUserProposals(userId) {
  const result = await query(
    `select p.*, j.title job_title, j.status job_status from proposals p join jobs j on j.id = p.job_id
     where p.freelancer_id = $1 order by p.created_at desc`,
    [userId]
  );
  return result.rows.map((row) => ({ ...mapProposal(row), job: { id: row.job_id, title: row.job_title, status: row.job_status } }));
}

async function changeProposalStatus(proposalId, requesterId, requestedStatus) {
  const status = requestedStatus.toUpperCase();
  if (status === 'ACCEPTED') return acceptProposal(proposalId, requesterId);
  if (status === 'REJECTED') return rejectProposal(proposalId, requesterId);
  const result = await query(
    `update proposals set status = $1 where id = $2 and freelancer_id = $3 and status = 'PENDING' returning *`,
    [status, proposalId, requesterId]
  );
  if (!result.rowCount) throw createError('Proposal not found or cannot be updated', 404);
  return { proposal: mapProposal(result.rows[0]) };
}

async function acceptProposal(proposalId, clientId) {
  return withTransaction(async (tx) => {
    const proposalResult = await tx.query(
      `select p.*, j.client_id, j.title, j.description, j.status job_status
       from proposals p join jobs j on j.id = p.job_id where p.id = $1 for update`,
      [proposalId]
    );
    const proposal = proposalResult.rows[0];
    if (!proposal) throw createError('Proposal not found', 404);
    if (proposal.client_id !== clientId) throw createError('Unauthorized to accept this proposal', 403);
    if (proposal.status !== 'PENDING' || proposal.job_status !== 'ACTIVE') throw createError('Proposal cannot be accepted', 400);

    const updated = await tx.query(`update proposals set status = 'ACCEPTED' where id = $1 returning *`, [proposalId]);
    await tx.query(`update proposals set status = 'REJECTED' where job_id = $1 and id <> $2 and status = 'PENDING'`, [proposal.job_id, proposalId]);
    await tx.query(`update jobs set status = 'IN_PROGRESS' where id = $1`, [proposal.job_id]);
    const project = await tx.query(
      `insert into projects (job_id, proposal_id, client_id, freelancer_id, title, description, budget, timeline, status)
       values ($1,$2,$3,$4,$5,$6,$7,$8,'ACTIVE') returning *`,
      [proposal.job_id, proposal.id, proposal.client_id, proposal.freelancer_id, proposal.title, proposal.description, proposal.proposed_budget, proposal.timeline]
    );
    await createNotification(tx, {
      userId: proposal.freelancer_id,
      title: 'Proposal Accepted',
      message: `Your proposal for "${proposal.title}" was accepted.`,
      type: 'proposal_accepted',
      data: { proposalId, projectId: project.rows[0].id }
    });
    return { proposal: mapProposal(updated.rows[0]), project: project.rows[0] };
  });
}

async function rejectProposal(proposalId, clientId) {
  const result = await query(
    `update proposals p set status = 'REJECTED'
     from jobs j where p.job_id = j.id and p.id = $1 and j.client_id = $2 and p.status = 'PENDING'
     returning p.*`,
    [proposalId, clientId]
  );
  if (!result.rowCount) throw createError('Proposal not found or cannot be rejected', 404);
  return { proposal: mapProposal(result.rows[0]) };
}

module.exports = { createProposal, listJobProposals, listUserProposals, changeProposalStatus, acceptProposal, rejectProposal };
