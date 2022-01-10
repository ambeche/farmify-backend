import 'dotenv/config';
import { PORT } from './utils/config';
import app from './app';
import http from 'http';
import { connectToDb, initializeDbWithExistingFarmData } from './utils/db';

const server = http.createServer(app);

void (async (): Promise<void> => {
  await connectToDb();
  await initializeDbWithExistingFarmData();
  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
})();
