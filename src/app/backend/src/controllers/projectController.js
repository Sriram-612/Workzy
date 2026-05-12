const { query } = require('../database/db');
const { createError } = require('../utils/errors');

async function getUserProjects(req, res) {
  const result = await query(
    `select * from projects where client_id = $1 or freelancer_id = $1 order by created_at desc`,
    [req.user.id]
  );
  res.json({ message: 'Projects retrieved successfully', projects: result.rows });
}

async function getProject(req, res) {
  const result = await query(`select * from projects where id = $1 and (client_id = $2 or freelancer_id = $2)`, [req.params.id, req.user.id]);
  if (!result.rowCount) throw createError('Project not found', 404);
  res.json({ project: result.rows[0] });
}

async function updateStatus(req, res) {
  const status = String(req.body.status || '').toUpperCase();
  if (!['PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED'].includes(status)) throw createError('Invalid project status', 400);
  const result = await query(
    `update projects set status = $1, completed_at = case when $1 = 'COMPLETED' then now() else completed_at end
     where id = $2 and (client_id = $3 or freelancer_id = $3) returning *`,
    [status, req.params.id, req.user.id]
  );
  if (!result.rowCount) throw createError('Project not found', 404);
  res.json({ message: 'Project status updated', project: result.rows[0] });
}

async function signAgreement(req, res) {
  const result = await query(`update projects set status = 'ACTIVE' where id = $1 and (client_id = $2 or freelancer_id = $2) returning *`, [req.params.id, req.user.id]);
  if (!result.rowCount) throw createError('Project not found', 404);
  res.json({ message: 'Agreement signed', project: result.rows[0] });
}

async function submitDelivery(req, res) {
  const result = await query(
    `update projects set delivery_url = $1, delivery_notes = $2 where id = $3 and freelancer_id = $4 returning *`,
    [req.body.deliveryUrl || null, req.body.deliveryNotes || '', req.params.id, req.user.id]
  );
  if (!result.rowCount) throw createError('Project not found', 404);
  res.json({ message: 'Delivery submitted', project: result.rows[0] });
}

async function stats(req, res) {
  const result = await query(
    `select
      coalesce(sum(case when status = 'COMPLETED' and freelancer_id = $1 then budget else 0 end), 0)::numeric as total_earnings,
      count(*) filter (where status = 'ACTIVE')::int as active_projects,
      count(*) filter (where status = 'COMPLETED')::int as completed_projects
     from projects where client_id = $1 or freelancer_id = $1`,
    [req.user.id]
  );
  res.json({
    message: 'Stats retrieved successfully',
    stats: {
      totalEarnings: Number(result.rows[0].total_earnings),
      activeProjects: result.rows[0].active_projects,
      completedProjects: result.rows[0].completed_projects
    }
  });
}

module.exports = { getUserProjects, getProject, updateStatus, signAgreement, submitDelivery, stats };
