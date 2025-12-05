// @ts-nocheck
// index.js
const path = require('path');
const fs = require('fs');
const Logger = require('./lib/logger');
const StorageManager = require('./lib/storage');

// Please raise issue on github or mail "dineshsaravanan93@gmail.com" if anything you found! it will be helpful to improvise this package

/**
 * Request Profiler Middleware
 * options:
 *   storage: 'json' | 'sqlite'(implementation pending) | false
 *   storagepath / storagePath: directory or full file path for logs (paths ok)
 *   slowThreshold: ms to mark slow (default 500)
 *   format: 'text' | 'json' | 'both' (default 'text')
 *   logFile: fallback filename (default 'logs.ndjson')
 *   dbFile: sqlite file (default 'logs.db')
 *   silent: boolean (default false)
 */
function requestProfiler(options = {}) {
  const opts = options || {};

  const config = {
    storage: opts.storage || false,
    slowThreshold: (opts.slowThreshold ?? 500),
    format: opts.format || 'text',
    logFile: opts.logFile || 'logs.ndjson',
    dbFile: opts.dbFile || 'logs.db',
    silent: opts.silent || false,
    storagepath: opts.storagepath || opts.storagePath || null,
    maxRotateBytes: opts.maxRotateBytes || 1024 * 1024 * 5, 
    maxLines: opts.maxLines || 1000,
    ...opts
  };

  if (config.storagepath) {
    const resolved = path.resolve(config.storagepath);
    try {
      const stat = fs.existsSync(resolved) && fs.statSync(resolved);
      if (stat && stat.isDirectory()) {
        config.logFile = path.join(resolved, config.logFile);
      } else {
        config.logFile = resolved;
      }
    } catch (err) {
      config.logFile = resolved;
    }
  }

  const logger = new Logger(config);

  let storage = config.storage ? new StorageManager(config) : null;

  if (storage) {
    storage.init().catch(err => {
      console.error('RequestProfiler: failed to initialize storage:', err && err.message ? err.message : err);
      storage = null;
    });
  }

  return function requestProfilerMiddleware(req, res, next) {
    const startTime = Date.now();

    // we capture startDate here
    const startDate = new Date();

    // finishing final log write happens here
    const onFinish = () => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      const now = new Date();

      const logData = {
        // ISO  timestamp and also a local timestamp here
        timestamp: now.toISOString(),
        timestampLocal: now.toLocaleString(),
        method: req.method,
        path: req.originalUrl || req.url || req.path || req.url,
        status: res.statusCode,
        durationMs: duration,
        userAgent: (req.get && req.get('User-Agent')) || (req.headers && (req.headers['user-agent'] || req.headers['User-Agent'])) || '',
        ip: (req.headers && (req.headers['x-forwarded-for'] || req.headers['X-Forwarded-For'])) || req.ip || (req.connection && req.connection.remoteAddress) || (req.socket && req.socket.remoteAddress) || ''
      };

      // L silent console logic
      if (!config.silent) {
        try {
          logger.logToConsole(logData);
        } catch (err) {
          console.error('RequestProfiler: logger error', err && err.message ? err.message : err);
        }
      }

      if (storage) {
        storage.store(logData).catch(err => {
          console.error('RequestProfiler: failed to store log:', err && err.message ? err.message : err);
        });
      }

      cleanup();
    };

    const onClose = () => {
      // connection abort
      cleanup();
    };

    const cleanup = () => {
      res.removeListener('finish', onFinish);
      res.removeListener('close', onClose);
    };

    res.on('finish', onFinish);
    res.on('close', onClose);

    return next && typeof next === 'function' ? next() : undefined;
  };
}

module.exports = requestProfiler;
