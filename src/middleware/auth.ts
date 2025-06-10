import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user';
import logger from '../utils/logger';

declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Get token from cookie or Authorization header
        const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { id: string };
            const user = await User.findByPk(decoded.id);

            if (!user) {
                res.status(401).json({ message: 'User not found' });
                return;
            }

            if (!user.isActive) {
                res.status(401).json({ message: 'User is inactive' });
                return;
            }

            req.user = user;
            next();
        } catch (error) {
            logger.error('Token verification error:', error);
            res.status(401).json({ message: 'Invalid token' });
            return;
        }
    } catch (error) {
        logger.error('Authentication error:', error);
        res.status(401).json({ message: 'Authentication failed' });
        return;
    }
}; 