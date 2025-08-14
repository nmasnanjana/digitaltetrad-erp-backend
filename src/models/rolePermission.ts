import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/dbConfig';
import Role from './role';
import Permission from './permission';

class RolePermission extends Model {
    public id!: string;
    public roleId!: string;
    public permissionId!: string;
}

RolePermission.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        roleId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: Role,
                key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
        permissionId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: Permission,
                key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
    },
    {
        sequelize,
        modelName: 'RolePermission',
        tableName: 'role_permissions',
        timestamps: true,
        indexes: [
            {
                name: 'role_permissions_role_id_fk',
                fields: ['roleId'],
            },
            {
                name: 'role_permissions_permission_id_fk',
                fields: ['permissionId'],
            },
            {
                name: 'role_permissions_unique',
                fields: ['roleId', 'permissionId'],
                unique: true,
            },
        ],
    }
);

export default RolePermission; 