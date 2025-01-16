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
    console.log('Received webhook:', JSON.stringify(req.body, null, 2));
    
    const { function_call_id: id, function_call } = req.body;
    const { approved, reject_option_name, comment } = function_call?.status || {};
    const kwargs = function_call?.spec?.kwargs;
    
    console.log('kwargs:', JSON.stringify(kwargs, null, 2));
    
    try {
      let classification = await db.getClassification(id);
      
      // Create new classification if not found
      if (!classification) {
        if (!kwargs?.to || !kwargs?.from || !kwargs?.subject || !kwargs?.body || !kwargs?.classification) {
          console.error(`Missing required fields for new classification`, {
            kwargs,
            timestamp: new Date().toISOString()
          });
          return res.status(400).json({ error: 'Missing required fields for new classification' });
        }
        
        const email = {
          to: kwargs.to,
          from: kwargs.from,
          subject: kwargs.subject,
          body: kwargs.body
        };
        
        await db.createClassification(id, email, kwargs.classification);
        classification = await db.getClassification(id);
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