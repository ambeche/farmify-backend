import express from 'express';
import farmRouter from './routes/farmRouter';

const app = express();

app.use('/farms', farmRouter);

// health check: verify deployment status
app.get('/health', (_req, res) => {
  res.send('ok');
});

export default app;
