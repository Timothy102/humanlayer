import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { Classification } from './common';

export interface DbClassificationState {
  id: string;
  email_to: string;
  email_from: string;
  email_subject: string;
  email_body: string;
  ai_classification: Classification;
  human_classification?: Classification;
  status: 'pending' | 'completed';
  created_at: string;
  updated_at: string;
  human_comment?: string;
}

class Database {
  private db: any;

  async initialize() {
    this.db = await open({
      filename: './classifications.db',
      driver: sqlite3.Database
    });

    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS classifications (
        id TEXT PRIMARY KEY,
        email_to TEXT NOT NULL,
        email_from TEXT NOT NULL,
        email_subject TEXT NOT NULL,
        email_body TEXT NOT NULL,
        ai_classification TEXT NOT NULL,
        human_classification TEXT,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        human_comment TEXT
      )
    `);
  }

  async createClassification(
    id: string,
    email: any,
    aiClassification: Classification
  ): Promise<void> {
    await this.db.run(
      `INSERT INTO classifications (
        id,
        email_to,
        email_from,
        email_subject,
        email_body,
        ai_classification,
        status,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        email.to,
        email.from,
        email.subject,
        email.body,
        aiClassification,
        'pending',
        new Date().toISOString(),
        new Date().toISOString()
      ]
    );
  }

  async updateClassification(
    id: string,
    humanClassification: Classification,
    humanComment?: string
  ): Promise<void> {
    await this.db.run(
      `UPDATE classifications
       SET human_classification = ?,
           human_comment = ?,
           status = 'completed',
           updated_at = ?
       WHERE id = ?`,
      [
        humanClassification,
        humanComment,
        new Date().toISOString(),
        id
      ]
    );
  }

  async getClassification(id: string): Promise<DbClassificationState | null> {
    return this.db.get(
      'SELECT * FROM classifications WHERE id = ?',
      [id]
    );
  }

  async getAllClassifications(): Promise<DbClassificationState[]> {
    return this.db.all('SELECT * FROM classifications');
  }

  async getPendingClassifications(): Promise<DbClassificationState[]> {
    return this.db.all(
      'SELECT * FROM classifications WHERE status = ?',
      ['pending']
    );
  }

  async getCompletedClassifications(): Promise<DbClassificationState[]> {
    return this.db.all(
      'SELECT * FROM classifications WHERE status = ?',
      ['completed']
    );
  }
}

export const db = new Database();