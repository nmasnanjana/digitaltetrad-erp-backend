import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/dbConfig';

class Role extends Model {
    public id!: string;
    public name!: string;
    public description?: string;
    public isActive!: boolean;
}

Role.init(
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
        modelName: 'Role',
        tableName: 'roles',
        timestamps: true,
    }
);

export default Role;
 