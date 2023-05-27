import { v4 as uuidv4 } from 'uuid';
import { set, del } from '../utils/redis';
import { client } from '../utils/db';

const AuthController = {
  getConnect: async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString();
    const [email, password] = credentials.split(':');

    if (!email || !password) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const db = client.db();
      const usersCollection = db.collection('users');

      const user = await usersCollection.findOne({ email, password: sha1(password) });

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const token = uuidv4();
      const redisKey = `auth_${token}`;
      const userId = user._id.toString();

      await set(redisKey, userId, 24 * 60 * 60);

      res.status(200).json({ token });
    } catch (error) {
      console.error('Error connecting user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  getDisconnect: async (req, res) => {
    const token = req.headers['x-token'];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const redisKey = `auth_${token}`;
      const result = await del(redisKey);

      if (result === 0) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      res.sendStatus(204);
    } catch (error) {
      console.error('Error disconnecting user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
};

export default AuthController;
