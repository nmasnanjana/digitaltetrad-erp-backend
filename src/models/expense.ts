import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/dbConfig';
import ExpenseType from './expenseType';
import Job from './job';
import User from './user';

class Expense extends Model {
    public id!: number;
    public expenses_type_id!: number;
    public operations!: boolean;
    public job_id?: number;
    public description!: string;
    public amount!: number;
    public edited_by!: string;
    public createdAt!: Date;
    public updatedAt!: Date;
}

Expense.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        expenses_type_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: ExpenseType,
                key: 'id',
            },
        },
        operations: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        job_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: Job,
                key: 'id',
            },
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        amount: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        edited_by: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: User,
                key: 'id',
            },
        },
    },
    {
        sequelize,
        modelName: 'Expense',
        timestamps: true,
        createdAt: true,
        updatedAt: true,
    }
);

// Add associations
Expense.belongsTo(ExpenseType, { foreignKey: 'expenses_type_id' });
Expense.belongsTo(Job, { foreignKey: 'job_id' });
Expense.belongsTo(User, { foreignKey: 'edited_by' });

export default Expense; 