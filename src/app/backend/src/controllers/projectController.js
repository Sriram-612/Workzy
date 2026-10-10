const { query } = require('../database/db');
const { createError } = require('../utils/errors');

async function getUserProjects(req, res) {
  const result = await query(
    `select
       pr.*,
       uc.name as client_name,
       uc.email as client_email,
       uc.avatar as client_avatar,
       uf.name as freelancer_name,
       uf.email as freelancer_email,
       uf.avatar as freelancer_avatar
     from projects pr
     left join users uc on uc.id = pr.client_id
     left join users uf on uf.id = pr.freelancer_id
     where pr.client_id = $1 or pr.freelancer_id = $1
     order by pr.created_at desc`,
    [req.user.id]
  );
  res.json({ message: 'Projects retrieved successfully', projects: result.rows });
}

async function getProject(req, res) {
  const result = await query(
    `select
       pr.*,
       uc.name as client_name,
       uc.email as client_email,
       uc.avatar as client_avatar,
       uf.name as freelancer_name,
       uf.email as freelancer_email,
       uf.avatar as freelancer_avatar
     from projects pr
     left join users uc on uc.id = pr.client_id
     left join users uf on uf.id = pr.freelancer_id
     where pr.id = $1 and (pr.client_id = $2 or pr.freelancer_id = $2)`,
    [req.params.id, req.user.id]
  );
  if (!result.rowCount) throw createError('Project not found', 404);
  res.json({ project: result.rows[0] });
}

async function updateStatus(req, res) {
  const status = String(req.body.status || '').toLowerCase();
  if (!['proposal_accepted', 'payment_pending', 'paid_directly', 'active', 'submitted', 'completed', 'cancelled'].includes(status)) {
    throw createError('Invalid project status', 400);
  }
  if (['proposal_accepted', 'payment_pending', 'paid_directly', 'active'].includes(status)) {
    throw createError('This project status is controlled by the proposal and payment workflow', 400);
  }
  const result = await query(
    `update projects set status = $1, completed_at = case when $1 = 'completed' then now() else completed_at end
     where id = $2
       and (
         ($1 = 'submitted' and freelancer_id = $3 and status in ('active', 'submitted'))
         or ($1 = 'completed' and client_id = $3 and status in ('submitted', 'completed'))
         or ($1 = 'cancelled' and (client_id = $3 or freelancer_id = $3))
       )
     returning *`,
    [status, req.params.id, req.user.id]
  );
  if (!result.rowCount) throw createError('Project not found', 404);

  if (status === 'completed') {
    const proj = result.rows[0];
    try {
      await query(
        `update users set
           total_projects = (select count(*) from projects where (freelancer_id = users.id or client_id = users.id) and status in ('completed', 'COMPLETED')),
           completion_rate = coalesce(
             round(
               (count(*) filter (where status in ('completed', 'COMPLETED'))::numeric /
                nullif(count(*) filter (where status in ('completed', 'COMPLETED', 'cancelled', 'CANCELLED')), 0)
               ) * 100, 2
             ), 100
           )
         where id in ($1, $2)`,
        [proj.freelancer_id, proj.client_id]
      );
    } catch (e) {
      console.error('Failed to update user project stats:', e);
    }
  }

  res.json({ message: 'Project status updated', project: result.rows[0] });
}

async function signAgreement(req, res) {
  const result = await query(
    `update projects
     set status = case when status = 'PENDING' then 'proposal_accepted' else status end
     where id = $1 and (client_id = $2 or freelancer_id = $2)
     returning *`,
    [req.params.id, req.user.id]
  );
  if (!result.rowCount) throw createError('Project not found', 404);
  res.json({ message: 'Agreement signed. Payment is still required before work starts.', project: result.rows[0] });
}

async function submitDelivery(req, res) {
  const result = await query(
    `update projects
     set delivery_url = $1, delivery_notes = $2, status = 'submitted'
     where id = $3 and freelancer_id = $4 and status in ('active', 'submitted')
     returning *`,
    [req.body.deliveryUrl || null, req.body.deliveryNotes || '', req.params.id, req.user.id]
  );
  if (!result.rowCount) throw createError('Project not found', 404);
  res.json({ message: 'Delivery submitted', project: result.rows[0] });
}

async function stats(req, res) {
  const [projectStats, paymentStats, reviewStats] = await Promise.all([
    query(
      `select
        coalesce(sum(case when freelancer_id = $1 and status in ('completed', 'COMPLETED') then budget else 0 end), 0)::numeric as total_earnings,
        coalesce(sum(case when client_id = $1 and status not in ('cancelled', 'CANCELLED', 'DRAFT') then budget else 0 end), 0)::numeric as total_invested,
        count(*) filter (where (freelancer_id = $1 or client_id = $1) and status in ('active', 'ACTIVE', 'in-progress', 'IN_PROGRESS', 'submitted', 'payment_pending'))::int as active_projects,
        count(*) filter (where (freelancer_id = $1 or client_id = $1) and status in ('completed', 'COMPLETED'))::int as completed_projects,
        count(distinct freelancer_id) filter (where client_id = $1)::int as hired_freelancers
       from projects where client_id = $1 or freelancer_id = $1`,
      [req.user.id]
    ),
    query(
      `select
         coalesce(sum(amount) filter (where student_id = $1 and payment_status = 'paid_directly'), 0)::numeric as earned,
         coalesce(sum(amount) filter (where client_id = $1 and payment_status = 'paid_directly'), 0)::numeric as spent
       from payments`,
      [req.user.id]
    ),
    query(
      `select coalesce(
         nullif(round(avg(r.rating)::numeric, 1), 0),
         (select rating from users where id = $1),
         0
       ) as rating,
       count(r.id)::int as review_count
       from users u
       left join reviews r on r.reviewee_id = u.id and r.is_public = true
       where u.id = $1
       group by u.id, u.rating`,
      [req.user.id]
    )
  ]);

  const pRow = projectStats.rows[0] || {};
  const payRow = paymentStats.rows[0] || {};
  const rRow = reviewStats.rows[0] || {};

  const totalEarnings = Math.max(Number(pRow.total_earnings || 0), Number(payRow.earned || 0));
  const totalInvested = Math.max(Number(pRow.total_invested || 0), Number(payRow.spent || 0));

  res.json({
    message: 'Stats retrieved successfully',
    stats: {
      totalEarnings,
      totalInvested,
      activeProjects: pRow.active_projects || 0,
      completedProjects: pRow.completed_projects || 0,
      hiredFreelancers: pRow.hired_freelancers || 0,
      rating: Number(rRow.rating || 0),
      reviewCount: rRow.review_count || 0
    }
  });
}

module.exports = { getUserProjects, getProject, updateStatus, signAgreement, submitDelivery, stats };
