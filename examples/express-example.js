const express = require("express");
const requestProfiler = require("../index.js");

const app = express();

app.use(requestProfiler({ 
  storage: "json",     
  slowThreshold: 200,  
  format: "text"       
}));

// Sample routes
app.get("/", (req, res) => {
  res.json({ message: "Hello World!" });
});

app.get("/api/users", (req, res) => {
  // Simulate some processing time
  setTimeout(() => {
    res.json({ 
      users: ["Alice", "Bob", "Charlie"],
      total: 3
    });
  }, 150);
});

app.get("/api/slow", (req, res) => {
  // Simulate a slow endpoint
  setTimeout(() => {
    res.json({ message: "This was slow!" });
  }, 600);
});

app.get("/api/error", (req, res) => {
  res.status(500).json({ error: "Something went wrong!" });
});

app.get("/api/not-found", (req, res) => {
  res.status(404).json({ error: "Resource not found" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('📊 Request profiler is active');
  console.log('\nTry these endpoints:');
  console.log(`  GET http://localhost:${PORT}/`);
  console.log(`  GET http://localhost:${PORT}/api/users`);
  console.log(`  GET http://localhost:${PORT}/api/slow (will be marked as slow)`);
  console.log(`  GET http://localhost:${PORT}/api/error (500 error)`);
  console.log(`  GET http://localhost:${PORT}/api/not-found (404 error)`);
});