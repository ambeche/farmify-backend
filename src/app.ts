import express from 'express';
import farmRouter from './routes/farmRouter';
import userRouter from './routes/userRouter';
import middleWare from './utils/middleWare';

const app = express();
app.use(express.json());

app.use('/farms', farmRouter);
app.use('/users', userRouter);

app.use(middleWare.validationErrorHandler);

app.get('/health', (_req, res) => {
  res.send('ok');
});

export default app;
