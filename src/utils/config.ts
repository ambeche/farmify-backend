import 'dotenv/config';
const DATABASE_URL = process.env.DATABASE_URL;
const PORT = process.env.PORT || 3001;
const TOKEN_SECRET = process.env.TOKEN_SECRET;

export { DATABASE_URL, PORT, TOKEN_SECRET };
