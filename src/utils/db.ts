import { Sequelize } from 'sequelize';
import { DATABASE_URL } from './config';
import parseAndValidate from './parser';
import farmService from '../services/farmService';
import Farm from '../models/Farm';

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

const initializeDbWithExistingFarmData = async () => {
  try {
    const noDataInDb = await Farm.findAll();
    
    if (noDataInDb.length === 0) {
      const parsedFarmDataOnServer = await parseAndValidate.parseCsvFiles();
      const dataToDb = parsedFarmDataOnServer.map(async (records) => {
        return await farmService.createFarm(records);
      });
      await Promise.all(dataToDb);
    }
  } catch (error) {
    if (error instanceof Error)
      console.log('Dd Initialization failed', error.message);
  }
};

export { connectToDb, sequelize, initializeDbWithExistingFarmData };
