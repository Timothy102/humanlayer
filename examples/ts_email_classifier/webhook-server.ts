import express from 'express';
import { config } from "dotenv";
import { Classification } from "./common";
import { db } from './db';
import { join } from 'path';

config();

const app = express();
app.use(express.json());

app.use(express.static('public'));

app.post('/webhook', async (req, res) => {
    console.log('Received webhook:', req.body);
    
    const { function_call_id: id, approved, reject_option_name, comment } = req.body;
    
    try {
      const classification = await db.getClassification(id);
      if (!classification) {
        console.error(`Classification not found: ${id}`, {
          body: req.body,
          timestamp: new Date().toISOString()
        });
        return res.status(404).json({ error: 'Classification not found' });
      }

    const humanClassification = approved ? 
      classification.ai_classification : 
      (reject_option_name as Classification);

    await db.updateClassification(
      id,
      humanClassification,
      comment
    );

    console.log(`Updated classification ${id}:`, {
      original: classification.ai_classification,
      human: humanClassification,
      comment
    });

    res.json({ status: 'success' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API Routes
app.get('/api/classifications', async (req, res) => {
    try {
      const classifications = await db.getAllClassifications();
      res.json(classifications);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch classifications' });
    }
  });
  
  // Serve React app for all other routes
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'index.html'));
  });

const PORT = 3000;
app.listen(PORT, async () => {
  await db.initialize();
  console.log(`Webhook server running on port ${PORT}`);
});