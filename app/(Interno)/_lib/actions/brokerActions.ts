/**
 * Ações de Servidor para Gerenciamento de Brokers.
 * Este arquivo utiliza o SQLite para persistir as configurações de conexão
 * dos brokers MQTT de forma segura no lado do servidor.
 */
'use server';

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { BrokerConfig } from '../hooks/useBrokerConfigs';

import { Database } from 'sqlite';

let dbInstance: Database | null = null;

/**
 * Inicializa ou retorna a conexão com o banco de dados SQLite local.
 */
async function getDb() {
  if (!dbInstance) {
    dbInstance = await open({
      filename: './projectgrid.db',
      driver: sqlite3.Database,
    });

    await dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS brokers (
        id TEXT PRIMARY KEY,
        name TEXT,
        broker_url TEXT NOT NULL,
        username TEXT,
        password TEXT,
        port INTEGER NOT NULL,
        use_ssl INTEGER NOT NULL,
        user_id TEXT NOT NULL
      );
    `);
  }
  return dbInstance;
}

export interface BrokerConfigPublic {
  id: string;
  name: string | null;
  broker_url: string;
  port: number;
  use_ssl: boolean;
  user_id: string;
}

/**
 * Busca todos os brokers do usuário no banco de dados (incluindo dados sensíveis).
 */
export async function fetchBrokersServer(userId: string = 'demo-user'): Promise<BrokerConfig[]> {
  try {
    const db = await getDb();
    const rows = await db.all('SELECT * FROM brokers WHERE user_id = ?', [userId]);
    return rows.map((row) => ({
      ...row,
      use_ssl: Boolean(row.use_ssl),
    }));
  } catch (error) {
    console.error('Error fetching brokers:', error);
    return [];
  }
}

/**
 * Retorna apenas dados não sensíveis dos brokers para listagem na UI.
 */
/**
 * Retorna apenas dados não sensíveis dos brokers para listagem na UI.
 */
export async function fetchBrokersPublic(userId: string = 'demo-user'): Promise<BrokerConfigPublic[]> {
  try {
    const db = await getDb();
    const rows = await db.all('SELECT id, name, broker_url, port, use_ssl, user_id FROM brokers WHERE user_id = ?', [userId]);
    return rows.map((row) => ({
      ...row,
      use_ssl: Boolean(row.use_ssl),
    }));
  } catch (error) {
    console.error('Error fetching public brokers:', error);
    return [];
  }
}

/**
 * Retorna os segredos de um broker específico apenas quando necessário.
 */
/**
 * Retorna os segredos de um broker específico apenas quando necessário.
 */
export async function getBrokerSecret(id: string, userId: string = 'demo-user'): Promise<{ username?: string | null, password?: string | null } | null> {
  try {
    const db = await getDb();
    const row = await db.get('SELECT username, password FROM brokers WHERE id = ? AND user_id = ?', [id, userId]);
    return row || null;
  } catch (error) {
    console.error('Error fetching broker secret:', error);
    return null;
  }
}

/**
 * Salva ou atualiza uma configuração de broker no banco de dados.
 */
export async function saveBrokerServer(data: Partial<BrokerConfig> & { id?: string }, userId: string = 'demo-user'): Promise<boolean> {
  try {
    const db = await getDb();
    const id = data.id || `broker_${Date.now()}`;
    const name = data.name || null;
    const broker_url = data.broker_url || '';
    const username = data.username || null;
    const password = data.password || null;
    const port = Number(data.port) || 1883;
    const use_ssl = Boolean(data.use_ssl) ? 1 : 0;
    
    // O ID do usuário vem da sessão (VPS) ou de uma config local (Electron)
    const finalUserId = userId; 

    const existing = await db.get('SELECT id FROM brokers WHERE id = ? AND user_id = ?', [id, finalUserId]);

    if (existing) {
      // Update
      await db.run(
        `UPDATE brokers SET 
          name = ?, broker_url = ?, username = ?, password = ?, port = ?, use_ssl = ?
         WHERE id = ? AND user_id = ?`,
        [name, broker_url, username, password, port, use_ssl, id, finalUserId]
      );
    } else {
      // Insert
      await db.run(
        `INSERT INTO brokers (id, name, broker_url, username, password, port, use_ssl, user_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, name, broker_url, username, password, port, use_ssl, finalUserId]
      );
    }
    return true;
  } catch (error) {
    console.error('Error saving broker:', error);
    return false;
  }
}

/**
 * Remove um broker do banco de dados por ID.
 */
export async function deleteBrokerServer(id: string, userId: string = 'demo-user'): Promise<boolean> {
  try {
    const db = await getDb();
    await db.run('DELETE FROM brokers WHERE id = ? AND user_id = ?', [id, userId]);
    return true;
  } catch (error) {
    console.error('Error deleting broker:', error);
    return false;
  }
}
