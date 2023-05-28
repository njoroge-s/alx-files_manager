import { sha1 } from 'crypto';
import { client } from '../utils/db';

const UsersController = {
  postNew: async (req, res) => {
    const { email, password } = req.body;

    // Check if email is missing
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    //check if password is missing
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    try {
      // Check if email already exist
      const db = client.db();
      const usersCollection = db.collection('users');

      const existingUser = await usersCollection.findOne({ email });

      if (existingUser) {
        return res.status(400).json({ error: 'Already exist' });
      }

      //hash the password using SHA1
      const hashedPassword = sha1(password);

      //create a new user
      const newUser = {
        email,
        password: hashedPassword,
      };

      const result = await usersCollection.insertOne(newUser);

      // return the new user with id and email only
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
  getMe: async (req, res) => {
    const token = req.headers['x-token'];

    //finds the user based on the token(userId)
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const userId = await redisClient.get(`auth_${token}`);

      //checks if the user exists
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      //returns the user object with Id and email only
      const usersCollection = db.collection('users');

      const user = await usersCollection.findOne(
        { _id: db.ObjectID(userId) },
        { projection: { email: 1, _id: 1 } }
      );

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      res.status(200).json(user);
    } catch (error) {
      console.error('Error retrieving user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};

export default UsersController;