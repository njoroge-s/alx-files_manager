import { client, ObjectID } from '../utils/db';
import { get } from '../utils/redis';
import { writeFileSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

class FilesController {
  static async postNew(req, res) {
    const token = req.headers['x-token'];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const userId = await get(`auth_${token}`);

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { name, type, parentId, isPublic, data } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Missing name' });
      }

      if (!type || !['folder', 'file', 'image'].includes(type)) {
        return res.status(400).json({ error: 'Missing type' });
      }

      if (!data && type !== 'folder') {
        return res.status(400).json({ error: 'Missing data' });
      }

      const db = client.db();
      const filesCollection = db.collection('files');

      if (parentId) {
        const parentFile = await filesCollection.findOne({ _id: ObjectID(parentId) });

        if (!parentFile) {
          return res.status(400).json({ error: 'Parent not found' });
        }

        if (parentFile.type !== 'folder') {
          return res.status(400).json({ error: 'Parent is not a folder' });
        }
      }

      const file = {
        userId: ObjectID(userId),
        name,
        type,
        isPublic: isPublic || false,
        parentId: parentId || '0',
      };

      if (type === 'file' || type === 'image') {
        const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
        const filePath = `${folderPath}/${uuidv4()}`;

        const fileData = Buffer.from(data, 'base64');

        writeFileSync(filePath, fileData);

        file.localPath = filePath;
      }

      const result = await filesCollection.insertOne(file);
      const createdFile = result.ops[0];

      res.status(201).json(createdFile);
    } catch (error) {
      console.error('Error creating file:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default FilesController;