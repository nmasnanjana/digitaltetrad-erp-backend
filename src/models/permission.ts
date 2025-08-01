import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/dbConfig';

class Permission extends Model {
    public id!: string;
    public name!: string;
    public module!: string;
    public action!: string;
    public description!: string;
    public isActive!: boolean;
}

Permission.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        module: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        action: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        sequelize,
        modelName: 'Permission',
        tableName: 'permissions',
        timestamps: true,
        indexes: [
            {
                name: 'permissions_module_action_idx',
                fields: ['module', 'action'],
                unique: true,
            },
        ],
    }
);

export default Permission; 