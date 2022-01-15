import { UserInput } from './../models/User';
import User from '../models/User';
import bcrypt from 'bcrypt';

const addUser = async ({ username, password: pass }: UserInput) => {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(pass, salt);
  const newUser = await User.create(
    { username, password: passwordHash },
    { returning: ['username', 'createdAt'] }
  );

  return newUser;
};

const getUser = async (username: string) => await User.findByPk(username);

export default { addUser, getUser };
