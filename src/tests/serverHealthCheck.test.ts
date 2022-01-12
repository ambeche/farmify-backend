import supertest from 'supertest';
import app from '../app';
import { sequelize } from '../utils/db';

const api = supertest(app);

test('health check is ok; server is running', async () => {
  const serverStatus = await api.get('/health').expect(200);

  expect(serverStatus.text).toBe('ok');
});

afterAll(async () => {
  try {
    await sequelize.connectionManager.close();
  } catch (error) {
    if (error instanceof Error) console.log(error.message);
  }
});
