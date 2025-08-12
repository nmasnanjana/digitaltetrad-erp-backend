import fs from 'fs';
import path from 'path';
import Permission from '../models/permission';
import logger from '../utils/logger';

export class PermissionScanner {
    private controllersPath: string;
    private permissionMap: Map<string, { module: string; action: string; description: string }>;

    constructor() {
        // Environment-based scanning: TypeScript for development, JavaScript for production
        const isDevelopment = process.env.ENVIRONMENT === 'development';
        
        if (isDevelopment) {
            // Use source TypeScript files for development
            this.controllersPath = path.join(__dirname, '..', '..', 'src', 'controllers');
        } else {
            // Use compiled JavaScript files for production
            this.controllersPath = path.join(__dirname, '..', 'controllers');
        }
        
        this.permissionMap = new Map();
        logger.info(`PermissionScanner initialized for ${isDevelopment ? 'development' : 'production'} environment`);
    }

    private normalizeModuleName(controllerName: string): string {
        return controllerName
            .replace(/Controller$/, '')
            .toLowerCase();
    }

    private normalizeActionName(methodName: string): string {
        // Map method names to the specific action names expected by the routes
        const actionMap: { [key: string]: string } = {
            // Expense actions
            'reviewExpense': 'reviewexpense',
            'updatePaymentStatus': 'update',
            
            // Huawei PO actions
            'uploadExcelFile': 'uploadexcelfile',
            'downloadExcelFile': 'downloadexcelfile',
            
            // Permission actions
            'assignPermissionsToRole': 'assignpermissionstorole',
            'removePermissionsFromRole': 'removepermissionsfromrole',
            'scanAndSyncPermissions': 'scanandsyncpermissions',
            
            // Settings actions
            'resetSettings': 'resetsettings',
            
            // Default actions for common patterns
            'get': 'read',
            'list': 'read',
            'find': 'read',
            'create': 'create',
            'update': 'update',
            'delete': 'delete',
            'remove': 'delete',
            'review': 'review',
            'mark': 'update',
            'approve': 'update',
            'reject': 'update',
            'pay': 'update',
            'upload': 'create',
            'download': 'read',
            'assign': 'update',
            'scan': 'read',
            'sync': 'update',
            'reset': 'update',
        };

        const baseAction = methodName.toLowerCase();
        
        // First check for exact method name matches
        if (actionMap[methodName]) {
            return actionMap[methodName];
        }
        
        // Then check for prefix matches
        for (const [key, value] of Object.entries(actionMap)) {
            if (baseAction.startsWith(key.toLowerCase())) {
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
            const isDevelopment = process.env.ENVIRONMENT === 'development';
            const fileExtension = isDevelopment ? '.ts' : '.js';
            const controllerName = path.basename(filePath, fileExtension);
            const module = this.normalizeModuleName(controllerName);

            logger.info(`Scanning controller: ${controllerName} (${module})`);
            logger.info(`File content length: ${content.length} characters`);
            logger.info(`File type: ${isDevelopment ? 'TypeScript' : 'JavaScript'}`);

            // Simple regex to find method names - works with both TypeScript and JavaScript
            const methodRegex = /static\s+(?:async\s+)?(\w+)\s*\(/g;
            let match;
            let methodCount = 0;

            while ((match = methodRegex.exec(content)) !== null) {
                const methodName = match[1];
                const action = this.normalizeActionName(methodName);
                const permissionName = this.generatePermissionName(module, action);
                const description = this.generateDescription(module, action);

                logger.info(`Found method: ${methodName} -> ${action} -> ${permissionName}`);

                this.permissionMap.set(permissionName, {
                    module,
                    action,
                    description,
                });
                methodCount++;
            }

            logger.info(`Total methods found in ${controllerName}: ${methodCount}`);
        } catch (error) {
            logger.error(`Error scanning controller file ${filePath}:`, error);
        }
    }

    public async scanControllers(): Promise<void> {
        try {
            const files = fs.readdirSync(this.controllersPath);
            const isDevelopment = process.env.ENVIRONMENT === 'development';
            const fileExtension = isDevelopment ? '.ts' : '.js';
            
            logger.info(`Found ${files.length} files in controllers directory`);
            logger.info(`Controllers path: ${this.controllersPath}`);
            logger.info(`Scanning for ${fileExtension} files in ${isDevelopment ? 'development' : 'production'} mode`);
            
            for (const file of files) {
                if (file.endsWith(fileExtension) && !file.endsWith('.d.ts') && !file.endsWith('.d.js')) {
                    const filePath = path.join(this.controllersPath, file);
                    logger.info(`Scanning file: ${file} at path: ${filePath}`);
                    await this.scanControllerFile(filePath);
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

            // Add new permissions and reactivate existing ones
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
                } else {
                    // Reactivate existing permission if it was marked inactive
                    const existingPermission = existingPermissionMap.get(name)!;
                    if (!existingPermission.isActive) {
                        await existingPermission.update({ isActive: true });
                        logger.info(`Reactivated permission: ${name}`);
                    }
                }
            }

            // Mark unused permissions as inactive (only if they're not in the current scan)
            for (const permission of existingPermissions) {
                if (!this.permissionMap.has(permission.name)) {
                    await permission.update({ isActive: false });
                    logger.info(`Marked permission as inactive: ${permission.name}`);
                }
            }

            logger.info(`Sync completed. Total permissions in scan: ${this.permissionMap.size}`);
        } catch (error) {
            logger.error('Error syncing permissions:', error);
            throw error;
        }
    }
} 