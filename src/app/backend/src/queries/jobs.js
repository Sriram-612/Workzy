const { query } = require('../database/db');

/** Browse UI uses slug ids; stored jobs use display titles (see schema check on jobs.category). */
function normalizeCategoryFilter(category) {
  if (category == null || category === '') return null;
  const slugToStored = {
    development: 'Development',
    design: 'Design',
    'video-editing': 'Video Editing',
    'ai-content': 'AI & Content',
  };
  if (slugToStored[category]) return slugToStored[category];
  return category;
}

function mapJob(row) {
  if (!row) return row;
  return {
    id: row.id,
    clientId: row.client_id,
    title: row.title,
    description: row.description,
    requirements: row.requirements,
    skills: row.skills || [],
    category: row.category,
    budgetType: row.budget_type,
    fixedBudget: row.fixed_budget === null ? null : Number(row.fixed_budget),
    hourlyRate: row.hourly_rate === null ? null : Number(row.hourly_rate),
    duration: row.duration,
    experienceLevel: row.experience_level,
    status: row.status,
    isUrgent: row.is_urgent,
    proposalCount: Number(row.proposal_count || 0),
    client: row.client_id ? {
      id: row.client_id,
      name: row.client_name,
      avatar: row.client_avatar,
      company: row.company_name,
      rating: Number(row.client_rating || 0)
    } : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function createJob(clientId, data) {
  const result = await query(
    `insert into jobs (client_id, title, description, requirements, skills, category, budget_type, fixed_budget, hourly_rate, duration, experience_level, is_urgent)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) returning *`,
    [clientId, data.title, data.description, data.requirements || '', data.skills || [], data.category, data.budgetType, data.fixedBudget || null, data.hourlyRate || null, data.duration || '', data.experienceLevel, Boolean(data.isUrgent)]
  );
  return mapJob(result.rows[0]);
}

async function listJobs(filters) {
  const page = Number(filters.page || 1);
  const limit = Number(filters.limit || 12);
  const offset = (page - 1) * limit;
  const categoryFilter = normalizeCategoryFilter(filters.category);
  const params = [
    `%${filters.query || ''}%`,
    categoryFilter,
    filters.budgetType || null,
    filters.experienceLevel || null,
    filters.skills ? String(filters.skills).split(',').filter(Boolean) : [],
    filters.isUrgent === 'true',
    Number(filters.minBudget || 0),
    Number(filters.maxBudget || 100000000),
    limit,
    offset
  ];
  const where = `
    j.status = 'ACTIVE'
    and ($1 = '%%' or j.title ilike $1 or j.description ilike $1)
    and ($2::text is null or j.category = $2)
    and ($3::text is null or j.budget_type::text = $3)
    and ($4::text is null or j.experience_level::text = $4)
    and (cardinality($5::text[]) = 0 or j.skills && $5::text[])
    and ($6 = false or j.is_urgent = true)
    and ((j.budget_type = 'FIXED' and j.fixed_budget between $7 and $8) or (j.budget_type = 'HOURLY' and j.hourly_rate between $7 and $8))
  `;
  const base = `from jobs j join users u on u.id = j.client_id left join proposals p on p.job_id = j.id where ${where}`;
  const rows = await query(
    `select j.*, u.name client_name, u.avatar client_avatar, u.company_name, u.rating client_rating, count(p.id)::int proposal_count
     ${base}
     group by j.id, u.id
     order by j.created_at desc limit $9 offset $10`,
    params
  );
  const count = await query(`select count(distinct j.id)::int as count ${base}`, params.slice(0, 8));
  return { jobs: rows.rows.map(mapJob), total: count.rows[0].count, page, limit };
}

async function getJobById(id) {
  const result = await query(
    `select j.*, u.name client_name, u.avatar client_avatar, u.company_name, u.rating client_rating, count(p.id)::int proposal_count
     from jobs j join users u on u.id = j.client_id left join proposals p on p.job_id = j.id
     where j.id = $1 group by j.id, u.id`,
    [id]
  );
  return mapJob(result.rows[0]);
}

async function updateJob(id, clientId, data) {
  const result = await query(
    `update jobs set
      title = coalesce($1, title), description = coalesce($2, description), requirements = coalesce($3, requirements),
      skills = coalesce($4, skills), category = coalesce($5, category), budget_type = coalesce($6, budget_type),
      fixed_budget = coalesce($7, fixed_budget), hourly_rate = coalesce($8, hourly_rate), duration = coalesce($9, duration),
      experience_level = coalesce($10, experience_level), is_urgent = coalesce($11, is_urgent)
     where id = $12 and client_id = $13 returning *`,
    [data.title, data.description, data.requirements, data.skills, data.category, data.budgetType, data.fixedBudget, data.hourlyRate, data.duration, data.experienceLevel, data.isUrgent, id, clientId]
  );
  return mapJob(result.rows[0]);
}

async function closeJob(id, clientId) {
  const result = await query(`update jobs set status = 'CANCELLED' where id = $1 and client_id = $2 returning id`, [id, clientId]);
  return result.rowCount > 0;
}

async function listClientJobs(clientId) {
  const result = await query(
    `select j.*, count(p.id)::int proposal_count from jobs j left join proposals p on p.job_id = j.id
     where j.client_id = $1 group by j.id order by j.created_at desc`,
    [clientId]
  );
  return result.rows.map(mapJob);
}

async function saveJobForUser(userId, jobId) {
  const job = await query(`select id, status, client_id from jobs where id = $1`, [jobId]);
  if (!job.rowCount) return { ok: false, code: 'NOT_FOUND' };
  const j = job.rows[0];
  if (j.client_id === userId) return { ok: false, code: 'OWN_JOB' };
  if (j.status !== 'ACTIVE') return { ok: false, code: 'NOT_ACTIVE' };
  await query(`insert into saved_jobs (user_id, job_id) values ($1, $2) on conflict do nothing`, [userId, jobId]);
  return { ok: true };
}

async function unsaveJobForUser(userId, jobId) {
  await query(`delete from saved_jobs where user_id = $1 and job_id = $2`, [userId, jobId]);
  return { ok: true };
}

async function listSavedJobsForUser(userId) {
  const result = await query(
    `select j.*, u.name client_name, u.avatar client_avatar, u.company_name, u.rating client_rating, count(p.id)::int proposal_count
     from saved_jobs s
     join jobs j on j.id = s.job_id
     join users u on u.id = j.client_id
     left join proposals p on p.job_id = j.id
     where s.user_id = $1
     group by j.id, u.id, s.created_at
     order by s.created_at desc`,
    [userId]
  );
  return result.rows.map(mapJob);
}

async function isJobSaved(userId, jobId) {
  const r = await query(`select 1 from saved_jobs where user_id = $1 and job_id = $2`, [userId, jobId]);
  return r.rowCount > 0;
}

module.exports = { createJob, listJobs, getJobById, updateJob, closeJob, listClientJobs, mapJob, saveJobForUser, unsaveJobForUser, listSavedJobsForUser, isJobSaved };
