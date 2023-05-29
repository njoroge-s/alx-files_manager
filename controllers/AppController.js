import { isAlive } from '../redis';
import { isAlive as _isAlive, nbUsers, nbFiles } from '../db';

async function getStatus(req, res) {
  const redisAlive = isAlive();
  const dbAlive = await _isAlive();

  const status = {
    redis: redisAlive,
    db: dbAlive,
  };

  return res.status(200).json(status);
}

async function getStats(req, res) {
  try {
    const usersCount = await nbUsers();
    const filesCount = await nbFiles();

    const stats = {
      users: usersCount,
      files: filesCount,
    };

    return res.status(200).json(stats);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export default {
  getStatus,
  getStats,
};