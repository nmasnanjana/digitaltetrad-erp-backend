import express from 'express';
import logger from './utils/logger';
import dotenv from 'dotenv';
import sequelize from './config/db_config'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4575;

// Middleware
app.use(express.json());

// Test route
app.get('/', (req, res) => {
    res.send('Server is running');
});

// Start server
app.listen(PORT, async () => {
    logger.info(`Server running at http://localhost:${PORT}`);

    try {
        await sequelize.authenticate();
        logger.info("Database authenticated successfully.");
    } catch (e: unknown) {
        if (e instanceof Error) {
            logger.error(e.message);  // Safely access 'message' property
        } else {
            logger.error('An unknown error occurred');
        }
    }

});
