const users = require('../queries/users');
const { createError } = require('../utils/errors');

async function updateProfile(req, res) {
  const user = await users.updateUserProfile(req.user.id, req.body);
  res.json({ message: 'Profile updated successfully', user });
}

async function getProfile(req, res) {
  const user = await users.findUserById(req.params.id);
  if (!user) throw createError('User not found', 404);
  res.json({ message: 'User profile retrieved successfully', user });
}

async function searchFreelancers(req, res) {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 12);
  const result = await users.searchFreelancers({ ...req.query, page, limit });
  res.json({
    freelancers: result.freelancers,
    pagination: { page, limit, total: result.total, pages: Math.ceil(result.total / limit) }
  });
}

async function uploadAvatar(req, res) {
  if (!req.file) throw createError('No avatar uploaded', 400);
  const user = await users.updateUserProfile(req.user.id, { avatar: `/uploads/${req.file.filename}` });
  res.json({ message: 'Avatar uploaded successfully', user });
}

module.exports = { updateProfile, getProfile, searchFreelancers, uploadAvatar };
