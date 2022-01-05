import supertest from 'supertest';
import app from '../app';

const api = supertest(app);

test('health check is ok; server is running', async () => {
  const serverStatus = await api.get('/health').expect(200);

  expect(serverStatus.text).toBe('ok');
});
