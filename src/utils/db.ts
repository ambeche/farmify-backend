import { Sequelize } from 'sequelize';
import { Umzug } from 'umzug';
import {
  DATABASE_URL,
  FAKE_FARMER,
  FAKE_FARMER_PASSWORD,
  MIGRATION_FILE_PATH,
} from './config';
import parseAndValidate from './parser';
import farmService from '../services/farmService';
import Farm from '../models/Farm';
import userService from '../services/userService';
import { SequelizeStorage } from 'umzug';

const sequelize = new Sequelize(parseAndValidate.parseString(DATABASE_URL), {
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

const runDbMigrations = async () => {
  const migrator = new Umzug({
    storage: new SequelizeStorage({ sequelize }),
    context: sequelize.getQueryInterface(),
    migrations: {
      glob: MIGRATION_FILE_PATH,
    },
    logger: console,
  });
  const migrations = await migrator.up();
  console.log(
    'Migrations up to date',
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      files: migrations.map((mig) => mig),
    },
    MIGRATION_FILE_PATH
  );
};

const initializeDbWithExistingFarmData = async () => {
  try {
    const noDataInDb = await Farm.findAll();
    if (noDataInDb.length === 0) {
      const mockedUserAsFarmOwner = await userService.addUser({
        username: `${FAKE_FARMER}-${Date.now()}`,
        password: `${FAKE_FARMER_PASSWORD}`,
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
    await runDbMigrations();
    await initializeDbWithExistingFarmData();
  } catch (error) {
    if (error instanceof Error)
      console.log('connecting database failed', error.message);
    return process.exit(1);
  }

  return;
};

export { connectToDb, sequelize, initializeDbWithExistingFarmData };
