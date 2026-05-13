const { query, withTransaction } = require('../database/db');
const { createError } = require('../utils/errors');
const { createNotification } = require('./notificationService');

function normEnum(v) {
  if (v == null || v === '') return null;
  return String(v).trim().toUpperCase();
}

function mapProposal(row) {
  if (!row) return row;
  return {
    id: row.id,
    jobId: row.job_id,
    freelancerId: row.freelancer_id,
    coverLetter: row.cover_letter,
    proposedBudget: Number(row.proposed_budget),
    timeline: row.timeline,
    status: normEnum(row.status) || row.status,
    hireOfferStatus: normEnum(row.hire_offer_status),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    freelancer: row.freelancer_name
      ? {
          id: row.freelancer_id,
          name: row.freelancer_name,
          email: row.freelancer_email || undefined,
          avatar: row.freelancer_avatar,
          skills: row.freelancer_skills || [],
          rating: Number(row.freelancer_rating || 0),
          bio: row.freelancer_bio || undefined,
          hourlyRate:
            row.freelancer_hourly_rate !== undefined && row.freelancer_hourly_rate !== null
              ? Number(row.freelancer_hourly_rate)
              : undefined,
        }
      : undefined,
  };
}

async function createProposal(userId, data) {
  const jobResult = await query('select id, client_id, status, title from jobs where id = $1', [data.jobId]);
  const job = jobResult.rows[0];
  if (!job) throw createError('Job not found', 404);
  if (normEnum(job.status) !== 'ACTIVE') throw createError('Job is not accepting proposals', 400);
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
    title: 'New proposal received',
    message: `You received a new application for "${job.title}".`,
    type: 'proposal_received',
    data: { proposalId: result.rows[0].id, jobId: job.id },
  });
  return mapProposal(result.rows[0]);
}

async function listJobProposals(jobId, requesterId) {
  const owner = await query('select client_id from jobs where id = $1', [jobId]);
  if (!owner.rowCount) throw createError('Job not found', 404);
  if (String(owner.rows[0].client_id) !== String(requesterId)) {
    throw createError('Unauthorized to view proposals for this job', 403);
  }
  const result = await query(
    `select p.*, u.name freelancer_name, u.email freelancer_email, u.avatar freelancer_avatar,
            u.skills freelancer_skills, u.rating freelancer_rating, u.bio freelancer_bio, u.hourly_rate freelancer_hourly_rate
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
  return result.rows.map((row) => ({
    ...mapProposal(row),
    job: { id: row.job_id, title: row.job_title, status: row.job_status },
  }));
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

async function sendHireOffer(proposalId, clientId) {
  const r = await query(
    `select p.id, p.freelancer_id, p.hire_offer_status, p.status, j.client_id, j.title as job_title, j.id as job_id, uc.name as client_name
     from proposals p
     join jobs j on j.id = p.job_id
     join users uc on uc.id = j.client_id
     where p.id = $1`,
    [proposalId]
  );
  const row = r.rows[0];
  if (!row) throw createError('Proposal not found', 404);
  if (String(row.client_id) !== String(clientId)) throw createError('Unauthorized', 403);
  if (normEnum(row.status) !== 'PENDING') throw createError('This application is no longer pending', 400);
  if (normEnum(row.hire_offer_status) === 'PENDING') {
    throw createError('A hire invitation is already waiting for this applicant', 400);
  }

  try {
    await query(`update proposals set hire_offer_status = 'PENDING' where id = $1`, [proposalId]);
  } catch (e) {
    if (e && e.code === '42703') {
      throw createError(
        'Hiring is not set up on the database yet. From the backend folder run: npm run db:migrate',
        503
      );
    }
    throw e;
  }
  await createNotification(null, {
    userId: row.freelancer_id,
    title: 'You received a hire offer',
    message: `${row.client_name} wants to hire you for "${row.job_title}". Open Notifications to accept or decline.`,
    type: 'hire_offer',
    data: { proposalId: row.id, jobId: row.job_id },
  });
  return { message: 'Hire invitation sent' };
}

async function respondToHireOffer(proposalId, freelancerId, accept) {
  if (accept) {
    return withTransaction(async (tx) => {
      const proposalResult = await tx.query(
        `select p.*, j.client_id, j.title, j.description, j.status as job_status, uf.name as freelancer_name
         from proposals p
         join jobs j on j.id = p.job_id
         join users uf on uf.id = p.freelancer_id
         where p.id = $1 and p.freelancer_id = $2 for update`,
        [proposalId, freelancerId]
      );
      const proposal = proposalResult.rows[0];
      if (!proposal) throw createError('Proposal not found', 404);
      if (normEnum(proposal.hire_offer_status) !== 'PENDING') {
        throw createError('No pending hire invitation for this application', 400);
      }
      if (normEnum(proposal.status) !== 'PENDING' || normEnum(proposal.job_status) !== 'ACTIVE') {
        throw createError('This hire offer can no longer be accepted', 400);
      }

      await tx.query(`update proposals set status = 'ACCEPTED', hire_offer_status = 'ACCEPTED' where id = $1`, [proposalId]);
      await tx.query(
        `update proposals set status = 'REJECTED', hire_offer_status = null where job_id = $1 and id <> $2 and status = 'PENDING'`,
        [proposal.job_id, proposalId]
      );
      await tx.query(`update jobs set status = 'IN_PROGRESS' where id = $1`, [proposal.job_id]);
      const project = await tx.query(
        `insert into projects (job_id, proposal_id, client_id, freelancer_id, title, description, budget, timeline, status)
         values ($1,$2,$3,$4,$5,$6,$7,$8,'ACTIVE') returning *`,
        [
          proposal.job_id,
          proposal.id,
          proposal.client_id,
          proposal.freelancer_id,
          proposal.title,
          proposal.description,
          proposal.proposed_budget,
          proposal.timeline,
        ]
      );
      const projectId = project.rows[0].id;
      await createNotification(tx, {
        userId: proposal.client_id,
        title: 'Hire offer accepted',
        message: `${proposal.freelancer_name} accepted your hire offer for "${proposal.title}".`,
        type: 'hire_offer_accepted',
        data: { proposalId, projectId, jobId: proposal.job_id },
      });
      await createNotification(tx, {
        userId: proposal.freelancer_id,
        title: 'Project started',
        message: `You accepted the hire for "${proposal.title}". The project is now active.`,
        type: 'project_started',
        data: { proposalId, projectId, jobId: proposal.job_id },
      });
      await createNotification(tx, {
        userId: proposal.client_id,
        title: 'Project started',
        message: `Your project "${proposal.title}" is now active with your hired freelancer.`,
        type: 'project_started',
        data: { proposalId, projectId, jobId: proposal.job_id },
      });
      const updated = await tx.query(`select * from proposals where id = $1`, [proposalId]);
      return { proposal: mapProposal(updated.rows[0]), project: project.rows[0] };
    });
  }

  const dec = await query(
    `update proposals p set hire_offer_status = null
     from jobs j
     where p.job_id = j.id and p.id = $1 and p.freelancer_id = $2 and p.hire_offer_status = 'PENDING'
     returning p.*, j.client_id, j.title as job_title, j.id as job_id`,
    [proposalId, freelancerId]
  );
  if (!dec.rowCount) throw createError('No pending hire invitation', 400);
  const row = dec.rows[0];
  await createNotification(null, {
    userId: row.client_id,
    title: 'Hire offer declined',
    message: `An applicant declined your hire offer for "${row.job_title}".`,
    type: 'hire_offer_declined',
    data: { proposalId: row.id, jobId: row.job_id },
  });
  return { declined: true };
}

async function acceptProposal(proposalId, clientId) {
  return withTransaction(async (tx) => {
    const proposalResult = await tx.query(
      `select p.*, j.client_id, j.title, j.description, j.status as job_status
       from proposals p join jobs j on j.id = p.job_id where p.id = $1 for update`,
      [proposalId]
    );
    const proposal = proposalResult.rows[0];
    if (!proposal) throw createError('Proposal not found', 404);
    if (String(proposal.client_id) !== String(clientId)) throw createError('Unauthorized to accept this proposal', 403);
    if (normEnum(proposal.hire_offer_status) === 'PENDING') {
      throw createError(
        'This applicant has a pending hire invitation. Wait for them to respond in Notifications, or they must decline first.',
        400
      );
    }
    if (normEnum(proposal.status) !== 'PENDING' || normEnum(proposal.job_status) !== 'ACTIVE') {
      throw createError('Proposal cannot be accepted', 400);
    }

    const updated = await tx.query(`update proposals set status = 'ACCEPTED' where id = $1 returning *`, [proposalId]);
    await tx.query(`update proposals set status = 'REJECTED' where job_id = $1 and id <> $2 and status = 'PENDING'`, [
      proposal.job_id,
      proposalId,
    ]);
    await tx.query(`update jobs set status = 'IN_PROGRESS' where id = $1`, [proposal.job_id]);
    const project = await tx.query(
      `insert into projects (job_id, proposal_id, client_id, freelancer_id, title, description, budget, timeline, status)
       values ($1,$2,$3,$4,$5,$6,$7,$8,'ACTIVE') returning *`,
      [
        proposal.job_id,
        proposal.id,
        proposal.client_id,
        proposal.freelancer_id,
        proposal.title,
        proposal.description,
        proposal.proposed_budget,
        proposal.timeline,
      ]
    );
    await createNotification(tx, {
      userId: proposal.freelancer_id,
      title: 'Project started',
      message: `Your proposal for "${proposal.title}" was accepted. The project is now active.`,
      type: 'project_started',
      data: { proposalId: proposal.id, projectId: project.rows[0].id, jobId: proposal.job_id },
    });
    await createNotification(tx, {
      userId: proposal.client_id,
      title: 'Project started',
      message: `Your project "${proposal.title}" is now active with your hired freelancer.`,
      type: 'project_started',
      data: { proposalId: proposal.id, projectId: project.rows[0].id, jobId: proposal.job_id },
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

module.exports = {
  createProposal,
  listJobProposals,
  listUserProposals,
  changeProposalStatus,
  acceptProposal,
  rejectProposal,
  sendHireOffer,
  respondToHireOffer,
};
