// const fs = require('fs').promises;
// const path = require('path');
// const sqlite3 = require('sqlite3').verbose();

// class StorageManager {
//   constructor(config) {
//     this.config = config;
//     this.db = null;
//   }

//   async init() {
//     if (this.config.storage === 'sqlite') {
//       await this.initSQLite();
//     } else if (this.config.storage === 'json') {
//       await this.initJSONFile();
//     }
//   }

//   async initSQLite() {
//     return new Promise((resolve, reject) => {
//       this.db = new sqlite3.Database(this.config.dbFile, (err) => {
//         if (err) {
//           reject(err);
//           return;
//         }

//         // Create logs table if it doesn't exist
//         this.db.run(`
//           CREATE TABLE IF NOT EXISTS request_logs (
//             id INTEGER PRIMARY KEY AUTOINCREMENT,
//             timestamp TEXT NOT NULL,
//             method TEXT NOT NULL,
//             path TEXT NOT NULL,
//             status INTEGER NOT NULL,
//             duration_ms INTEGER NOT NULL,
//             user_agent TEXT,
//             ip TEXT,
//             created_at DATETIME DEFAULT CURRENT_TIMESTAMP
//           )
//         `, (err) => {
//           if (err) {
//             reject(err);
//           } else {
//             resolve();
//           }
//         });
//       });
//     });
//   }

//   async initJSONFile() {
//     try {
//       await fs.access(this.config.logFile);
//     } catch {
//       // File doesn't exist, create it with empty array
//       await fs.writeFile(this.config.logFile, '[]', 'utf8');
//     }
//   }

//   async store(logData) {
//     if (this.config.storage === 'sqlite') {
//       return this.storeToSQLite(logData);
//     } else if (this.config.storage === 'json') {
//       return this.storeToJSON(logData);
//     }
//   }

//   async storeToSQLite(logData) {
//     return new Promise((resolve, reject) => {
//       if (!this.db) {
//         reject(new Error('SQLite database not initialized'));
//         return;
//       }

//       const stmt = this.db.prepare(`
//         INSERT INTO request_logs 
//         (timestamp, method, path, status, duration_ms, user_agent, ip)
//         VALUES (?, ?, ?, ?, ?, ?, ?)
//       `);

//       stmt.run([
//         logData.timestamp,
//         logData.method,
//         logData.path,
//         logData.status,
//         logData.durationMs,
//         logData.userAgent,
//         logData.ip
//       ], (err) => {
//         if (err) {
//           reject(err);
//         } else {
//           resolve();
//         }
//       });

//       stmt.finalize();
//     });
//   }

//   async storeToJSON(logData) {
//     try {
//       const data = await fs.readFile(this.config.logFile, 'utf8');
//       const logs = JSON.parse(data);
//       logs.push(logData);
      
//       // Keep only last 1000 logs to prevent file from growing too large
//       if (logs.length > 1000) {
//         logs.splice(0, logs.length - 1000);
//       }
      
//       await fs.writeFile(this.config.logFile, JSON.stringify(logs, null, 2), 'utf8');
//     } catch (err) {
//       throw new Error(`Failed to write to JSON log file: ${err.message}`);
//     }
//   }

//   async getLogs(limit = 100) {
//     if (this.config.storage === 'sqlite') {
//       return this.getLogsFromSQLite(limit);
//     } else if (this.config.storage === 'json') {
//       return this.getLogsFromJSON(limit);
//     }
//     return [];
//   }

//   async getLogsFromSQLite(limit) {
//     return new Promise((resolve, reject) => {
//       if (!this.db) {
//         reject(new Error('SQLite database not initialized'));
//         return;
//       }

//       this.db.all(
//         'SELECT * FROM request_logs ORDER BY created_at DESC LIMIT ?',
//         [limit],
//         (err, rows) => {
//           if (err) {
//             reject(err);
//           } else {
//             resolve(rows);
//           }
//         }
//       );
//     });
//   }

//   async getLogsFromJSON(limit) {
//     try {
//       const data = await fs.readFile(this.config.logFile, 'utf8');
//       const logs = JSON.parse(data);
//       return logs.slice(-limit).reverse();
//     } catch (err) {
//       throw new Error(`Failed to read JSON log file: ${err.message}`);
//     }
//   }

//   close() {
//     if (this.db) {
//       this.db.close();
//     }
//   }
// }

// module.exports = StorageManager;