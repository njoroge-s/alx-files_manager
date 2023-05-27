import { isAlive } from '../utils/redis';
import { isAlive as _isAlive, nbUsers, nbFiles } from '../utils/db';

const AppController = {
  getStatus: async (req, res) => {
    const redisStatus = isAlive();
    const dbStatus = await _isAlive();

    const status = {
      redis: redisStatus,
      db: dbStatus,
    };

    res.status(200).json(status);
  },

  getStats: async (req, res) => {
    try {
      const usersCount = await nbUsers();
      const filesCount = await nbFiles();

      const stats = {
        users: usersCount,
        files: filesCount,
      };

      res.status(200).json(stats);
    } catch (error) {
      console.error('Error retrieving stats:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
};

export default AppController;
