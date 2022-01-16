import 'dotenv/config';
import path from 'path';
const DATABASE_URL = process.env.DATABASE_URL;
const PORT = process.env.PORT || 3001;
const TOKEN_SECRET = process.env.TOKEN_SECRET;
const FAKE_FARMER = process.env.FAKE_FARMER;
const FAKE_FARMER_PASSWORD = process.env.FAKE_FARMER_PASSWORD;

const MIGRATION_FILE_PATH =
  process.env.NODE_ENV === 'production'
    ? `${process.cwd()}${path.join(
        '/build/migration_initialize_farmdata_farm_user.js'
      )}`
    : `${process.cwd()}${path.join(
        '/migration_initialize_farmdata_farm_user.ts'
      )}`;

export {
  DATABASE_URL,
  PORT,
  TOKEN_SECRET,
  FAKE_FARMER_PASSWORD,
  FAKE_FARMER,
  MIGRATION_FILE_PATH,
};
