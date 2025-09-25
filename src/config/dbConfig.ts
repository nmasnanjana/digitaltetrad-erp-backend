import {Sequelize} from "sequelize";
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize({
    dialect: "mysql",
    database: process.env.DB_NAME || 'erp',
    host: process.env.DB_HOST || '127.0.0.1',
    username: process.env.DB_USERNAME || 'dev',
    password: process.env.DB_PASSWORD || 'dev',
    port: parseInt(process.env.DB_PORT || '3307', 10),
    logging: false,
});

export default sequelize;