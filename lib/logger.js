const colors = require('./colors');

class Logger {
  constructor(config) {
    this.config = config;
  }

  logToConsole(logData) {
    const { format } = this.config;

    if (format === 'json' || format === 'both') {
      console.log(JSON.stringify(logData, null, 2));
    }

    if (format === 'text' || format === 'both') {
      this.logTextFormat(logData);
    }
  }

  logTextFormat(logData) {
    const { timestamp, method, path, status, durationMs } = logData;
    const time = new Date(timestamp).toLocaleTimeString();
    
    // Determine color based on status code
    let statusColor = colors.green;
    if (status >= 400 && status < 500) {
      statusColor = colors.yellow;
    } else if (status >= 500) {
      statusColor = colors.red;
    }

    // Check if request is slow
    const isSlow = durationMs > this.config.slowThreshold;
    const durationColor = isSlow ? colors.red : colors.dim;
    const slowIndicator = isSlow ? colors.red(' [SLOW]') : '';

    const logMessage = [
      colors.dim(`[${time}]`),
      colors.cyan(method),
      colors.white(path),
      '→',
      statusColor(`${status} ${this.getStatusText(status)}`),
      durationColor(`(${durationMs} ms)`),
      slowIndicator
    ].join(' ');

    console.log(logMessage);
  }

  getStatusText(status) {
    const statusTexts = {
      200: 'OK',
      201: 'Created',
      204: 'No Content',
      301: 'Moved Permanently',
      302: 'Found',
      304: 'Not Modified',
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      405: 'Method Not Allowed',
      409: 'Conflict',
      422: 'Unprocessable Entity',
      429: 'Too Many Requests',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
      504: 'Gateway Timeout'
    };

    return statusTexts[status] || 'Unknown';
  }
}

module.exports = Logger;