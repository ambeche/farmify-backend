import { Sequelize } from 'sequelize';
import { DATABASE_URL } from './config';
import parseAndValidate from './parser';

const sequelize = new Sequelize(parseAndValidate.parseString(DATABASE_URL), {
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

const connectToDb = async () => {
  try {
    await sequelize.authenticate();
    console.log('database connected');
  } catch (error) {
    if (error instanceof Error)
      console.log('connecting database failed', error.message);
    return process.exit(1);
  }

  return;
};

export { connectToDb, sequelize };
