import tap from 'tap';
import fastify from 'fastify';

/** @type {ReturnType<fastify>} */
let server;

async function getResponse() {
  await server.listen(0);
  const address = server.server.address();
  if (typeof address !== 'object') throw new Error();
  const response = await fetch(`http://localhost:${address.port}`);
  const body = await response.text();
  await server.close();
  return body;
}

tap.beforeEach(() => {
  server = fastify();
});

tap.test('no await', async (t) => {
  server.get('/', () => {
    throw new Error('foo');
  });
  server.register(
    async (instance) => {
      instance.get('/', async () => 'baz');
    },
    { prefix: '/bar' }
  );
  server.setErrorHandler(async (error) => {
    return error.message;
  });

  t.equal(await getResponse(), 'foo');
});

tap.test('await register', async (t) => {
  server.get('/', () => {
    throw new Error('foo');
  });
  await server.register(
    async (instance) => {
      instance.get('/', async () => 'baz');
    },
    { prefix: '/bar' }
  );
  server.setErrorHandler(async (error) => {
    return error.message;
  });

  t.equal(await getResponse(), 'foo');
});

tap.test('await register after error handler', async (t) => {
  server.get('/', () => {
    throw new Error('foo');
  });
  server.setErrorHandler(async (error) => {
    return error.message;
  });
  await server.register(
    async (instance) => {
      instance.get('/', async () => 'baz');
    },
    { prefix: '/bar' }
  );

  t.equal(await getResponse(), 'foo');
});
