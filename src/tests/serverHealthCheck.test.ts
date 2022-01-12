import supertest from 'supertest';
import app from '../app';
import { sequelize } from '../utils/db';

const api = supertest(app);

test('health check is ok; server is running', async () => {
  const serverStatus = await api.get('/health').expect(200);

  expect(serverStatus.text).toBe('ok');
});

afterAll(() => {
  sequelize.close().catch((error) => console.log(error.message));
});
