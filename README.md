# Request Profiler

A lightweight middleware for Node.js web frameworks that logs request/response details with optional persistence. Perfect for performance monitoring, debugging, and keeping track of your API usage patterns.

## Features

- 🚀 **Framework Agnostic**: Works with Express, Fastify, and other Node.js frameworks
- 🎨 **Colorized Logs**: Beautiful console output with color-coded status codes
- 💾 **Persistent Storage**: Save logs to JSON files or SQLite database
- ⚡ **Performance Alerts**: Highlight slow requests automatically
- 🎛️ **Configurable**: Customize log format, storage, and thresholds
- 📊 **Lightweight**: Minimal overhead and dependencies

## Installation

```bash
npm install request-profiler
```

## Quick Start

### Express

```javascript
const express = require("express");
const requestProfiler = require("request-profiler");

const app = express();

// Add the middleware
app.use(requestProfiler({ 
  storage: "json",
  slowThreshold: 500
}));

app.get("/api/users", (req, res) => {
  res.json({ users: ["Alice", "Bob"] });
});

app.listen(3000);
```

### Fastify

```javascript
const fastify = require('fastify')();
const requestProfiler = require("request-profiler");

// Register as a hook
fastify.addHook('onRequest', (request, reply, done) => {
  const middleware = requestProfiler({ storage: "sqlite" });
  middleware(request.raw, reply.raw, done);
});

fastify.get('/api/users', async (request, reply) => {
  return { users: ['John', 'Jane'] };
});

await fastify.listen({ port: 3000 });
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `storage` | `string\|boolean` | `false` | Storage type: `'json'`, `'sqlite'`, or `false` |
| `slowThreshold` | `number` | `500` | Threshold in ms to mark requests as slow |
| `format` | `string` | `'text'` | Log format: `'text'`, `'json'`, or `'both'` |
| `logFile` | `string` | `'logs.json'` | Custom JSON log file path |
| `dbFile` | `string` | `'logs.db'` | Custom SQLite database file path |
| `silent` | `boolean` | `false` | Disable console output |

## Examples

### Basic Usage

```javascript
app.use(requestProfiler());
```

### JSON Storage with Custom Threshold

```javascript
app.use(requestProfiler({
  storage: "json",
  slowThreshold: 200,
  logFile: "api-logs.json"
}));
```

### SQLite Storage with JSON Output

```javascript
app.use(requestProfiler({
  storage: "sqlite",
  format: "both",
  dbFile: "performance.db"
}));
```

### Silent Mode (Storage Only)

```javascript
app.use(requestProfiler({
  storage: "sqlite",
  silent: true
}));
```

## Console Output

The middleware produces colorized console logs:

```
[01:25:14] GET /api/users → 200 OK (45 ms)
[01:25:15] POST /api/users → 201 Created (123 ms)
[01:25:16] GET /api/slow → 200 OK (678 ms) [SLOW]
[01:25:17] GET /api/missing → 404 Not Found (12 ms)
[01:25:18] POST /api/error → 500 Internal Server Error (5 ms)
```

**Color Coding:**
- 🟢 Green: 2xx status codes (success)
- 🟡 Yellow: 4xx status codes (client errors)
- 🔴 Red: 5xx status codes (server errors)
- 🔴 Red: Slow requests (above threshold)

## Storage Formats

### JSON File Storage

Logs are stored as an array of objects:

```json
[
  {
    "timestamp": "2025-01-01T01:25:14.123Z",
    "method": "GET",
    "path": "/api/users",
    "status": 200,
    "durationMs": 45,
    "userAgent": "Mozilla/5.0...",
    "ip": "127.0.0.1"
  }
]
```

### SQLite Storage

Logs are stored in a `request_logs` table with the following schema:

```sql
CREATE TABLE request_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL,
  method TEXT NOT NULL,
  path TEXT NOT NULL,
  status INTEGER NOT NULL,
  duration_ms INTEGER NOT NULL,
  user_agent TEXT,
  ip TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Advanced Usage

### Accessing Stored Logs

```javascript
const requestProfiler = require("request-profiler");
const StorageManager = require("request-profiler/lib/storage");

// Create storage instance
const storage = new StorageManager({
  storage: "sqlite",
  dbFile: "logs.db"
});

// Initialize and get recent logs
await storage.init();
const recentLogs = await storage.getLogs(50); // Get last 50 logs
console.log(recentLogs);
```

### Custom Log Analysis

```javascript
// Example: Find slow endpoints
const logs = await storage.getLogs(1000);
const slowEndpoints = logs
  .filter(log => log.durationMs > 500)
  .sort((a, b) => b.durationMs - a.durationMs);

console.log('Slowest endpoints:', slowEndpoints.slice(0, 10));
```

## Use Cases

- **Development**: Monitor API performance during development
- **Debugging**: Identify slow endpoints and bottlenecks
- **Performance Monitoring**: Track response times over time
- **Analytics**: Analyze usage patterns and popular endpoints
- **Error Tracking**: Monitor error rates and status codes

## Requirements

- Node.js >= 14.0.0
- Compatible with Express, Fastify, and other Node.js HTTP frameworks
