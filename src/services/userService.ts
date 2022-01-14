import { UserInput } from './../models/User';
import User from '../models/User';

const addUser = async ({ username, password }: UserInput) => {
  const passwordHash = password + 'hello';
  const newUser = await User.create({ username, passwordHash });

  return newUser;
};

export default { addUser };
