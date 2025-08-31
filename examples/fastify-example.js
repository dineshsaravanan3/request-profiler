const fastify = require('fastify')({ logger: false });
const requestProfiler = require("../index.js");

// Register the request profiler middleware
fastify.addHook('onRequest', (request, reply, done) => {
  const middleware = requestProfiler({
    storage: "sqlite",
    slowThreshold: 300,
    format: "both"
  });
  
  // Adapt Express-style middleware for Fastify
  middleware(request.raw, reply.raw, done);
});

// Sample routes
fastify.get('/', async (request, reply) => {
  return { message: 'Hello Fastify with Request Profiler!' };
});

fastify.get('/api/users', async (request, reply) => {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return {
    users: ['John', 'Jane', 'Bob'],
    total: 3
  };
});

fastify.get('/api/slow', async (request, reply) => {
  // Simulate slow endpoint
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return { message: 'This was slow in Fastify!' };
});

fastify.get('/api/error', async (request, reply) => {
  reply.code(500);
  return { error: 'Fastify server error!' };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3001 });
    console.log('🚀 Fastify server running on http://localhost:3001');
    console.log('📊 Request profiler is active');
    console.log('\nTry these endpoints:');
    console.log('  GET http://localhost:3001/');
    console.log('  GET http://localhost:3001/api/users');
    console.log('  GET http://localhost:3001/api/slow (will be marked as slow)');
    console.log('  GET http://localhost:3001/api/error (500 error)');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();