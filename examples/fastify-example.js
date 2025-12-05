// examples/fastify-example.js
// @ts-ignore
const fastify = require('fastify')({ logger: false });
const requestProfiler = require('../index.js');

const middleware = requestProfiler({
  storage: 'json',
  slowThreshold: 300,
  format: 'both'
});

// @ts-ignore
fastify.addHook('onRequest', (request, reply, done) => {
  middleware(request.raw, reply.raw, done);
});

// @ts-ignore
fastify.get('/', async (request, reply) => {
  return { message: 'Hello Fastify with Request Profiler!' };
});

// @ts-ignore
fastify.get('/api/slow', async (request, reply) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return { message: 'This was slow in Fastify!' };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3001 });
    console.log('🚀 Fastify server running on http://localhost:3001');
    console.log('📊 Request profiler is active');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
