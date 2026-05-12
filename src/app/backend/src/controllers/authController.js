const authService = require('../services/authService');
const users = require('../queries/users');

async function register(req, res) {
  const result = await authService.register(req.body);
  res.status(201).json({ message: 'User created successfully', ...result });
}

async function login(req, res) {
  const result = await authService.login(req.body);
  res.json({ message: 'Login successful', ...result });
}

async function me(req, res) {
  const user = await users.findUserById(req.user.id);
  res.json({ message: 'User profile retrieved successfully', user });
}

async function logout(req, res) {
  res.json({ message: 'Logged out successfully' });
}

module.exports = { register, login, me, logout };
