import express from 'express';
import { getCsvFilesFromServer } from './utils/utils';

const app = express();

app.get('/health', (_req, res) => {
  res.send('ok');
});

getCsvFilesFromServer();

export default app;
