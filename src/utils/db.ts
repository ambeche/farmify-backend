import { Sequelize } from 'sequelize';
import { DATABASE_URL, FAKE_FARMER, FAKE_FARMER_PASSWORD } from './config';
import parseAndValidate from './parser';
import farmService from '../services/farmService';
import Farm from '../models/Farm';
import userService from '../services/userService';

const sequelize = new Sequelize(parseAndValidate.parseString(DATABASE_URL), {
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

const initializeDbWithExistingFarmData = async () => {
  try {
    const noDataInDb = await Farm.findAll();
    if (noDataInDb.length === 0) {
      const mockedUserAsFarmOwner = await userService.addUser({
        username: parseAndValidate.parseString(FAKE_FARMER),
        password: parseAndValidate.parseString(FAKE_FARMER_PASSWORD),
      });
      const parsedFarmDataOnServer = await parseAndValidate.parseCsvFiles();

      const dataToDb = parsedFarmDataOnServer.map(async (records) => {
        return await farmService.createFarm(
          records,
          mockedUserAsFarmOwner.username
        );
      });
      await Promise.all(dataToDb);
    }
  } catch (error) {
    if (error instanceof Error) console.log('Db Initialization failed', error);
  }
};

const connectToDb = async () => {
  try {
    await sequelize.authenticate();
    console.log('database connected');
    //await initializeDbWithExistingFarmData();
  } catch (error) {
    if (error instanceof Error)
      console.log('connecting database failed', error.message);
    return process.exit(1);
  }

  return;
};

export { connectToDb, sequelize, initializeDbWithExistingFarmData };
