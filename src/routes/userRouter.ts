import { UserInputForValidation } from './../types';
import express from 'express';
import userService from '../services/userService';
import parseAndValidate from '../utils/parser';

const userRouter = express.Router();

// eslint-disable-next-line @typescript-eslint/no-misused-promises
userRouter.post('/', async (req, res, next) => {
  try {
    const validatedUserInput = parseAndValidate.parseUserInput(
      req.body as UserInputForValidation
    );
    if (!validatedUserInput?.password || !validatedUserInput?.username) {
      return res.json({ error: 'missing or invalid data!' });
    }
    const addedUser = await userService.addUser(validatedUserInput);
    res.json(addedUser);
  } catch (error) {
    return next(error);
  }
});

export default userRouter;
