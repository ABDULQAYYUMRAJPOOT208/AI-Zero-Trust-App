import axios from 'axios';
import formidable from 'formidable';
import fs from 'fs';
import { verifyToken } from '@/middleware/verifyToken';

export const config = { api: { bodyParser: false } };

export default verifyToken(async (req: any, res: any) => {
  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'File upload error' });

    // Check if files.image is defined
    if (!files.image || !Array.isArray(files.image)) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const image = fs.createReadStream(files.image[0].filepath);
    try {
      const flaskRes = await axios.post('http://localhost:5000/api/predict', image, {
        headers: {
          Authorization: `Bearer ${req.cookies.token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      res.status(200).json(flaskRes.data);
    } catch (error) {
      res.status(500).json({ error: 'Error calling Flask backend' });
    }
  });
});
