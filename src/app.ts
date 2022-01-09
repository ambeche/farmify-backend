import express from 'express';
import parseAndValidate from './utils/parser';

const app = express();

app.get('/health', (_req, res) => {
  res.send('ok');
});

// eslint-disable-next-line @typescript-eslint/no-misused-promises
app.get('/farms', async (_req, res) => {
  const records = await parseAndValidate.parseCsvFiles();
  res.json(records);
});

parseAndValidate.getCsvFiles();

export default app;
