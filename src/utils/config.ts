import 'dotenv/config';
const DATABASE_URL = process.env.DATABASE_URL;
const PORT = process.env.PORT || 3001;
const TOKEN_SECRET = process.env.TOKEN_SECRET;
const FAKE_FARMER =process.env.FAKE_FARMER;
const FAKE_FARMER_PASSWORD = process.env.FAKE_FARMER_PASSWORD;

export { DATABASE_URL, PORT, TOKEN_SECRET, FAKE_FARMER_PASSWORD, FAKE_FARMER };
