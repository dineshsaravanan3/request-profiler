const Logger = require('./lib/logger');
const StorageManager = require('./lib/storage');

/**
 * Request Profiler Middleware
 * @param {Object} options - Configuration options
 * @param {string|boolean} options.storage - Storage type: 'json', 'sqlite', or false
 * @param {number} options.slowThreshold - Threshold in ms to mark requests as slow (default: 500)
 * @param {string} options.format - Log format: 'text', 'json', or 'both' (default: 'text')
 * @param {string} options.logFile - Custom log file path (default: 'logs.json')
 * @param {string} options.dbFile - Custom SQLite database file path (default: 'logs.db')
 * @param {boolean} options.silent - Disable console output (default: false)
 * @returns {Function} Middleware function
 */
// @ts-ignore
function requestProfiler(options = {}) {
  const config = {
    // storage: options.storage || false,
    // @ts-ignore
    slowThreshold: options.slowThreshold || 500,
    // @ts-ignore
    format: options.format || 'text',
    // @ts-ignore
    logFile: options.logFile || 'logs.json',
    // @ts-ignore
    dbFile: options.dbFile || 'logs.db',
    // @ts-ignore
    silent: options.silent || false,
    ...options
  };

  const logger = new Logger(config);
  const storage = config.storage ? new StorageManager(config) : null;

  // // Initialize storage if needed
  if (storage) {
    storage.init().catch(err => {
      console.error('Failed to initialize storage:', err.message);
    });
  }

  // @ts-ignore
  return function requestProfilerMiddleware(req, res, next) {
    const startTime = Date.now();
    const startDate = new Date();

    // Store original end method
    const originalEnd = res.end;

    // Override end method to capture response
    // @ts-ignore
    res.end = function(...args) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      const logData = {
        timestamp: startDate.toISOString(),
        method: req.method,
        path: req.url || req.path,
        status: res.statusCode,
        durationMs: duration,
        userAgent: req.get('User-Agent') || '',
        ip: req.ip || req.connection.remoteAddress || ''
      };

      // Log to console
      if (!config.silent) {
        logger.logToConsole(logData);
      }

      // Store to persistent storage
      // @ts-ignore
      if (storage) {
        // @ts-ignore
        storage.store(logData).catch(err => {
          console.error('Failed to store log:', err.message);
        });
      }

      // Call original end method
      originalEnd.apply(this, args);
    };

    next();
  };
}

module.exports = requestProfiler;