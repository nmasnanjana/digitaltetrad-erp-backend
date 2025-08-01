import {Model, DataTypes} from 'sequelize';
import sequelize from '../config/dbConfig';
import Job from './job';
import User from './user';

class PurchaseOrder extends Model {
    public id!: number;
    public job_id!: string;
    public po_number!: string;
    public amount!: number;
    public status!: string;
    public created_by!: string;
}

PurchaseOrder.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        job_id: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: Job,
                key: 'id',
            },
        },
        po_number: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        created_by: {
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
        modelName: 'PurchaseOrder',
        timestamps: true,
        createdAt: true,
        updatedAt: true,
    }
);

export default PurchaseOrder;
