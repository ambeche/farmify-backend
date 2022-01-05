import express from 'express';

const app = express();

app.get('/health', (_req, res) => {
  res.send('ok');
});

export default app;
