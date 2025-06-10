import { Request, Response, NextFunction } from 'express';
import User from '../models/user';
import Role from '../models/role';
import Permission from '../models/permission';
import logger from '../utils/logger';

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}

export const checkPermission = (module: string, action: string) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            // Get user's role and its permissions
            const role = await Role.findByPk(user.roleId, {
                include: [{
                    model: Permission,
                    as: 'permissions',
                    where: {
                        module,
                        action,
                        isActive: true
                    }
                }]
            }) as Role & { permissions?: Permission[] };

            if (!role || !role.permissions || role.permissions.length === 0) {
                logger.warn(`User ${user.id} attempted to access ${module}.${action} without permission`);
                res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
                return;
            }

            next();
        } catch (error) {
            logger.error('Error checking permissions:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
}; 