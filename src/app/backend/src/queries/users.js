const { query } = require('../database/db');
const { userToClient } = require('../utils/normalize');

const publicUserSelect = `
  id, name, email, role, is_profile_complete, avatar, skills, hourly_rate,
  company_name, company_description, company_logo, website, college_name,
  department, bio, portfolio_links, response_rate, completion_rate,
  total_projects, rating, created_at, updated_at
`;

async function findUserByEmail(email) {
  const result = await query(`select ${publicUserSelect}, password_hash from users where lower(email) = lower($1)`, [email]);
  return result.rows[0];
}

async function findUserById(id) {
  const result = await query(`select ${publicUserSelect} from users where id = $1`, [id]);
  return userToClient(result.rows[0]);
}

async function createUser({ name, email, passwordHash, role }) {
  const result = await query(
    `insert into users (name, email, password_hash, role)
     values ($1, lower($2), $3, $4)
     returning ${publicUserSelect}`,
    [name, email, passwordHash, role]
  );
  return userToClient(result.rows[0]);
}

async function updateUserProfile(userId, data) {
  const values = [
    data.name,
    data.collegeName || data.college_name,
    data.department,
    data.bio,
    data.skills,
    data.portfolio || data.portfolioLinks,
    data.avatar,
    data.hourlyRate,
    data.company || data.companyName,
    data.companyDescription,
    data.companyLogo,
    data.website,
    userId
  ];
  const result = await query(
    `update users set
      name = coalesce($1, name),
      college_name = coalesce($2, college_name),
      department = coalesce($3, department),
      bio = coalesce($4, bio),
      skills = coalesce($5, skills),
      portfolio_links = coalesce($6, portfolio_links),
      avatar = coalesce($7, avatar),
      hourly_rate = coalesce($8, hourly_rate),
      company_name = coalesce($9, company_name),
      company_description = coalesce($10, company_description),
      company_logo = coalesce($11, company_logo),
      website = coalesce($12, website),
      is_profile_complete = true
     where id = $13
     returning ${publicUserSelect}`,
    values
  );
  return userToClient(result.rows[0]);
}

async function searchFreelancers({ query: q = '', skills = '', page = 1, limit = 12 }) {
  const skillList = skills ? String(skills).split(',').filter(Boolean) : [];
  const offset = (Number(page) - 1) * Number(limit);
  const params = [`%${q}%`, skillList, Number(limit), offset];
  const where = `role = 'FREELANCER' and ($1 = '%%' or name ilike $1 or bio ilike $1) and (cardinality($2::text[]) = 0 or skills && $2::text[])`;
  const [rows, count] = await Promise.all([
    query(`select ${publicUserSelect} from users where ${where} order by rating desc, total_projects desc limit $3 offset $4`, params),
    query(`select count(*)::int as count from users where ${where}`, params.slice(0, 2))
  ]);
  return { freelancers: rows.rows.map(userToClient), total: count.rows[0].count };
}

module.exports = { findUserByEmail, findUserById, createUser, updateUserProfile, searchFreelancers, publicUserSelect };
