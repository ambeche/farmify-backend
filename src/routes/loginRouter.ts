import { UserInputForValidation } from './../types';
import express from 'express';
import parseAndValidate from '../utils/parser';
import userService from '../services/userService';
import bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { TOKEN_SECRET } from '../utils/config';

const loginRouter = express.Router();

// eslint-disable-next-line @typescript-eslint/no-misused-promises
loginRouter.post('/', async (req, res, next) => {
  try {
    const validatedInput = parseAndValidate.parseUserInput(
      req.body as UserInputForValidation
    );

    if (validatedInput?.username) {
      const user = await userService.getUser(validatedInput.username);

      if (user) {
        const verifiedPass = await bcrypt.compare(
          validatedInput.password,
          user?.password
        );
        if (user && verifiedPass) {
          const token = jwt.sign(
            { username: user.username, password: user.password },
            parseAndValidate.parseString(TOKEN_SECRET)
          );
          return res.json({ token, username: user.username });
        }
      }
    }
    return res.status(401).json({ error: 'missing or invalid credentials' });
  } catch (error) {
    return next(error);
  }
});

export default loginRouter;
