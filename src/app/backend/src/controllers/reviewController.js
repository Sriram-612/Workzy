const { query, withTransaction } = require('../database/db');
const { createError } = require('../utils/errors');

async function createReview(req, res) {
  const { projectId, revieweeId, rating, comment, isPublic = true } = req.body;
  const project = await query('select * from projects where id = $1 and (client_id = $2 or freelancer_id = $2)', [projectId, req.user.id]);
  if (!project.rowCount) throw createError('Project not found', 404);
  if (![project.rows[0].client_id, project.rows[0].freelancer_id].includes(revieweeId)) throw createError('Reviewee is not on this project', 400);
  if (revieweeId === req.user.id) throw createError('Cannot review yourself', 400);

  const review = await withTransaction(async (tx) => {
    const inserted = await tx.query(
      `insert into reviews (project_id, reviewer_id, reviewee_id, rating, comment, is_public)
       values ($1,$2,$3,$4,$5,$6) returning *`,
      [projectId, req.user.id, revieweeId, rating, comment || '', isPublic]
    );
    await tx.query(
      `update users set rating = coalesce((select round(avg(rating)::numeric, 2) from reviews where reviewee_id = $1 and is_public = true), 0)
       where id = $1`,
      [revieweeId]
    );
    return inserted.rows[0];
  }).catch((error) => {
    if (error.code === '23505') throw createError('Review already exists', 409);
    throw error;
  });
  res.status(201).json({ message: 'Review created successfully', review });
}

async function userReviews(req, res) {
  const result = await query(`select r.*, u.name reviewer_name from reviews r join users u on u.id = r.reviewer_id where reviewee_id = $1 and is_public = true order by created_at desc`, [req.params.userId]);
  res.json({ reviews: result.rows });
}

async function givenReviews(req, res) {
  const result = await query(`select * from reviews where reviewer_id = $1 order by created_at desc`, [req.user.id]);
  res.json({ reviews: result.rows });
}

async function projectReviews(req, res) {
  const result = await query(`select * from reviews where project_id = $1 order by created_at desc`, [req.params.projectId]);
  res.json({ reviews: result.rows });
}

async function reviewStats(req, res) {
  const result = await query(`select count(*)::int total, coalesce(round(avg(rating)::numeric, 2), 0) rating from reviews where reviewee_id = $1 and is_public = true`, [req.params.userId]);
  res.json({ stats: result.rows[0] });
}

module.exports = { createReview, userReviews, givenReviews, projectReviews, reviewStats };
