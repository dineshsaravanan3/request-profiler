// @ts-nocheck
// lib/storage.js
const fs = require('fs').promises;
const fssync = require('fs');
const path = require('path');

class StorageManager {
  constructor(config) {
    this.config = config;
    this.writeQueues = new Map();
  }

  async init() {
    if (this.config.storage === "json") {
      await this.initBaseDir();
      if (!this.config.daily) {
        await this.ensureFile(this.config.logFile, '[]');
      }
    } else {
      // For other storage types ==>> implement later(pinnar arivikka padum)
    }
  }

  async initBaseDir() {
    const baseFile = this.config.logFile;
    const dir = path.dirname(baseFile);
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (err) {
      // ignore
    }
  }

  getFilePathForDate(date = new Date()) {
    if (!this.config.daily) return this.config.logFile;

    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;

    const configured = this.config.logFile || 'logs.json';
    const configuredDir = path.dirname(configured);
    const configuredBase = path.basename(configured);

 
    const dir = path.dirname(configured);
    const filename = `${dateStr}.json`;
    return path.join(dir, filename);
  }

  async ensureFile(filePath, initialContent = '') {
    try {
      await fs.access(filePath);
    } catch (err) {
      await fs.mkdir(path.dirname(filePath), { recursive: true }).catch(() => {});
      await fs.writeFile(filePath, initialContent, 'utf8');
    }
  }

  // Main storage
  async store(logData) {
    if (this.config.storage !== 'json') return;

    const filePath = this.getFilePathForDate(new Date());

    await this.ensureFile(filePath, '[]');

    const current = this.writeQueues.get(filePath) || Promise.resolve();

    const next = current
      .then(async () => {
        try {
          const content = await fs.readFile(filePath, 'utf8');
          let arr = [];
          try {
            arr = JSON.parse(content || '[]');
            if (!Array.isArray(arr)) arr = [];
          } catch (err) {
            arr = [];
          }

          arr.push(logData);

         // only trim if max line provided
        if (typeof this.config.maxLines === 'number' && Number.isFinite(this.config.maxLines) && this.config.maxLines > 0) {
          const max = Number(this.config.maxLines);
          if (arr.length > max) {
            arr = arr.slice(-max);
          }
        }

          const pretty = JSON.stringify(arr, null, 2);

          const tempPath = `${filePath}.tmp`;
          await fs.writeFile(tempPath, pretty, 'utf8');
          await fs.rename(tempPath, filePath);
        } catch (err) {
          console.error('StorageManager JSON write error --->', err && err.message ? err.message : err);
        }
      })
      .catch(err => {
        console.error('StorageManager queue error:', err && err.message ? err.message : err);
      });

    this.writeQueues.set(filePath, next);

    return next;
  }

  async getLogs(limit = 100, date = new Date()) {
    const filePath = this.getFilePathForDate(date);
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const arr = JSON.parse(content || '[]');
      return arr.slice(-limit).reverse();
    } catch (err) {
      return [];
    }
  }

  close() {
  }
}

module.exports = StorageManager;
