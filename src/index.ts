import express from 'express';
import logger from './utils/logger';
import dotenv from 'dotenv';
import sequelize from './config/dbConfig';
import webRoutes from './routes/web';
import cors from 'cors';
import { setupAssociations } from './models/associations';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4575;

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use('/api', webRoutes);

// Start server
app.listen(PORT, async () => {
    logger.info(`Server running at http://localhost:${PORT}`);

    try {
        await sequelize.authenticate();
        logger.info("Database authenticated successfully.");

        // Set up model associations
        setupAssociations();
        logger.info("Model associations set up successfully.");

        // Sync models to database
        await sequelize.sync({ alter: true }); // use { force: true } to drop and recreate tables
        logger.info("Database synchronized successfully.");
    } catch (e: unknown) {
        if (e instanceof Error) {
            logger.error(e.message);
        } else {
            logger.error('An unknown error occurred');
        }
    }
});
