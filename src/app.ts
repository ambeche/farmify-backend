import express from 'express';
import farmRouter from './routes/farmRouter';
import middleWare from './utils/middleWare';

const app = express();

app.use('/farms', farmRouter);

app.use(middleWare.validationErrorHandler);

app.get('/health', (_req, res) => {
  res.send('ok');
});

export default app;
