import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/dbConfig';
import ExpenseType from './expenseType';
import Job from './job';
import User from './user';
import OperationType from './operationType';

class Expense extends Model {
    public id!: number;
    public expenses_type_id!: number;
    public operations!: boolean;
    public operation_type_id?: number;
    public job_id?: string;
    public description!: string;
    public amount!: number;
    public edited_by?: string;
    public reason_to_edit?: string;
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
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE',
        },
        operations: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        operation_type_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: OperationType,
                key: 'id',
            },
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE',
        },
        job_id: {
            type: DataTypes.STRING,
            allowNull: true,
            references: {
                model: Job,
                key: 'id',
            },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
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
            allowNull: true,
            references: {
                model: User,
                key: 'id',
            },
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE',
        },
        reason_to_edit: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: 'Expense',
        tableName: 'expenses',
        timestamps: true,
        indexes: [
            {
                name: 'expenses_type_id_fk',
                fields: ['expenses_type_id'],
            },
            {
                name: 'expenses_operation_type_id_fk',
                fields: ['operation_type_id'],
            },
            {
                name: 'expenses_job_id_fk',
                fields: ['job_id'],
            },
            {
                name: 'expenses_edited_by_fk',
                fields: ['edited_by'],
            },
        ],
    }
);

export default Expense; 