// examples/express-example.js
const express = require('express');
const requestProfiler = require('../index.js');
const path = require('path');

const app = express();


app.use(requestProfiler({
  storage: 'json',
  storagepath: path.resolve('C:/Users/xyz/OneDrive/Documents/merger_safe'),
  slowThreshold: 200,
  format: 'text',
  daily: true,
  maxLines: 2000
}));

app.get('/', (req, res) => {
  res.json({ message: 'Hello World!' });
});

app.get('/api/users', (req, res) => {
  setTimeout(() => {
    res.json({
      users: ['Alice', 'Bob', 'Charlie'],
      total: 3
    });
  }, 150);
});

app.get('/api/slow', (req, res) => {
  setTimeout(() => {
    res.json({ message: 'This was slow!' });
  }, 600);
});

app.get('/api/error', (req, res) => {
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('📊 Request profiler is active');
});
