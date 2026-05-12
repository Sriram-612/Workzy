const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const users = require('../queries/users');
const { roleToDb } = require('../utils/normalize');
const { createError } = require('../utils/errors');

function signToken(user) {
  return jwt.sign({ userId: user.id, email: user.email, role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn
  });
}

async function register(data) {
  const existing = await users.findUserByEmail(data.email);
  if (existing) throw createError('User with this email already exists', 409);
  const passwordHash = await bcrypt.hash(data.password, 12);
  const user = await users.createUser({ ...data, role: roleToDb(data.role), passwordHash });
  return { user, token: signToken(user) };
}

async function login({ email, password }) {
  const userRecord = await users.findUserByEmail(email);
  if (!userRecord) throw createError('Invalid email or password', 401);
  const ok = await bcrypt.compare(password, userRecord.password_hash);
  if (!ok) throw createError('Invalid email or password', 401);
  const user = users.userToClient ? users.userToClient(userRecord) : require('../utils/normalize').userToClient(userRecord);
  return { user, token: signToken(user) };
}

module.exports = { register, login, signToken };
