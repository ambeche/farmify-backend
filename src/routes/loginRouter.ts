import { UserInputForValidation } from './../types';
import express from 'express';
import parseAndValidate from '../utils/parser';
import bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { TOKEN_SECRET } from '../utils/config';
import { User } from '../models/Farm';

const loginRouter = express.Router();

// eslint-disable-next-line @typescript-eslint/no-misused-promises
loginRouter.post('/', async (req, res, next) => {
  try {
    const validatedInput = parseAndValidate.parseUserInput(
      req.body as UserInputForValidation
    );

    if (validatedInput?.username) {
      const user = await User.findByPk(validatedInput.username);
      console.log('user', JSON.stringify(user, null, 2));
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
          return res.json({
            token,
            username: user.username,
            farms: user.farms,
          });
        }
      }
    }
    return res.status(401).json({ error: 'missing or invalid credentials' });
  } catch (error) {
    return next(error);
  }
});

export default loginRouter;
