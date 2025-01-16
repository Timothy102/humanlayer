import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3001;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint for polling classifications
app.get('/api/classifications/poll', async (req, res) => {
  try {
    const db = await open({
      filename: path.join(__dirname, 'classifications.db'),
      driver: sqlite3.Database
    });

    const classifications = await db.all(`
      SELECT * FROM classifications 
      ORDER BY created_at DESC 
      LIMIT 100
    `);

    await db.close();
    res.json({ classifications });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Error fetching classifications' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});