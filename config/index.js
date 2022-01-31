import dotenv from "dotenv";
dotenv.config();
export  const config = {
    db: {
        port: process.env.DB_PORT || 8081,
		database: process.env.DB_NAME || 'mongoDB',
		password: process.env.DB_PASS || 'password',
		username: process.env.DB_USER || 'username',
		host: process.env.DB_HOST || '127.0.0.1',
		logging: true,
    }
}