import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/dbConfig';

class ExpenseType extends Model {
    public id!: number;
    public name!: string;
    public description?: string;
    public isActive!: boolean;
}

ExpenseType.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        sequelize,
        modelName: 'ExpenseType',
        timestamps: true,
        createdAt: true,
        updatedAt: true,
    }
);

export default ExpenseType; 