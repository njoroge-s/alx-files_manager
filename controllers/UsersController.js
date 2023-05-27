import { sha1 } from 'crypto';
import { client } from '../utils/db';

const UsersController = {
  postNew: async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    try {
      const db = client.db();
      const usersCollection = db.collection('users');

      const existingUser = await usersCollection.findOne({ email });

      if (existingUser) {
        return res.status(400).json({ error: 'Already exist' });
      }

      const hashedPassword = sha1(password);

      const newUser = {
        email,
        password: hashedPassword,
      };

      const result = await usersCollection.insertOne(newUser);

      const createdUser = {
        id: result.insertedId,
        email,
      };

      res.status(201).json(createdUser);
    } catch (error) {
      console.error('Error creating a new user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
};

export default UsersController;