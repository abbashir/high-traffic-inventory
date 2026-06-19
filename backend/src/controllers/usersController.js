import { prisma } from '../config/prisma.js';

export async function createUser(req, res, next) {
  const { username, email } = req.body;

  if (!username || !email) {
    return res.status(400).json({ error: 'username and email are required', code: 'VALIDATION_ERROR' });
  }

  try {
    const user = await prisma.user.create({ data: { username, email } });
    res.status(201).json({ user });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'username or email already exists', code: 'ALREADY_EXISTS' });
    }
    next(err);
  }
}

export async function listUsers(req, res, next) {
  try {
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'asc' } });
    res.json({ users });
  } catch (err) {
    next(err);
  }
}
