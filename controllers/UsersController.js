import sha1 from 'sha1';
import { client } from '../utils/db';

  async function postNew(req, res) {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Missing email' });
  }

  if (!password) {
    return res.status(400).json({ error: 'Missing password' });
  }

  const userExists = await client
    .db()
    .collection('users')
    .findOne({ email });

  if (userExists) {
    return res.status(400).json({ error: 'Already exist' });
  }

  const hashedPassword = sha1(password);

  const newUser = {
    email,
    password: hashedPassword,
  };

  const result = await client
    .db()
    .collection('users')
    .insertOne(newUser);

  const { _id: id } = result.ops[0];

  return res.status(201).json({ email, id });
}

async function getMe(req, res) {
  const { userId } = req;

  const user = await client
    .db()
    .collection('users')
    .findOne({ _id: ObjectId(userId) });

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { email, _id: id } = user;

  return res.status(200).json({ email, id });
}

export default {
  postNew,
  getMe,
};