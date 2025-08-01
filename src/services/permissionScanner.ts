import fs from 'fs';
import path from 'path';
import Permission from '../models/permission';
import logger from '../utils/logger';

export class PermissionScanner {
    private controllersPath: string;
    private permissionMap: Map<string, { module: string; action: string; description: string }>;

    constructor() {
        this.controllersPath = path.join(__dirname, '../controllers');
        this.permissionMap = new Map();
    }

    private normalizeModuleName(controllerName: string): string {
        return controllerName
            .replace(/Controller$/, '')
            .toLowerCase();
    }

    private normalizeActionName(methodName: string): string {
        const actionMap: { [key: string]: string } = {
            'get': 'read',
            'list': 'read',
            'find': 'read',
            'create': 'create',
            'update': 'update',
            'delete': 'delete',
            'remove': 'delete',
        };

        const baseAction = methodName.toLowerCase();
        for (const [key, value] of Object.entries(actionMap)) {
            if (baseAction.startsWith(key)) {
                return value;
            }
        }

        return baseAction;
    }

    private generatePermissionName(module: string, action: string): string {
        return `${module}.${action}`;
    }

    private generateDescription(module: string, action: string): string {
        return `Permission to ${action} ${module}`;
    }

    private async scanControllerFile(filePath: string): Promise<void> {
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const controllerName = path.basename(filePath, '.ts');
            const module = this.normalizeModuleName(controllerName);

            // Simple regex to find method names
            const methodRegex = /async\s+(\w+)\s*\(/g;
            let match;

            while ((match = methodRegex.exec(content)) !== null) {
                const methodName = match[1];
                const action = this.normalizeActionName(methodName);
                const permissionName = this.generatePermissionName(module, action);
                const description = this.generateDescription(module, action);

                this.permissionMap.set(permissionName, {
                    module,
                    action,
                    description,
                });
            }
        } catch (error) {
            logger.error(`Error scanning controller file ${filePath}:`, error);
        }
    }

    public async scanControllers(): Promise<void> {
        try {
            const files = fs.readdirSync(this.controllersPath);
            
            for (const file of files) {
                if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
                    await this.scanControllerFile(path.join(this.controllersPath, file));
                }
            }
        } catch (error) {
            logger.error('Error scanning controllers:', error);
            throw error;
        }
    }

    public async syncPermissions(): Promise<void> {
        try {
            // Get all existing permissions
            const existingPermissions = await Permission.findAll();
            const existingPermissionMap = new Map(
                existingPermissions.map(p => [p.name, p])
            );

            // Add new permissions
            for (const [name, { module, action, description }] of this.permissionMap) {
                if (!existingPermissionMap.has(name)) {
                    await Permission.create({
                        name,
                        module,
                        action,
                        description,
                        isActive: true,
                    });
                    logger.info(`Created new permission: ${name}`);
                }
            }

            // Mark unused permissions as inactive
            for (const permission of existingPermissions) {
                if (!this.permissionMap.has(permission.name)) {
                    await permission.update({ isActive: false });
                    logger.info(`Marked permission as inactive: ${permission.name}`);
                }
            }
        } catch (error) {
            logger.error('Error syncing permissions:', error);
            throw error;
        }
    }
} 