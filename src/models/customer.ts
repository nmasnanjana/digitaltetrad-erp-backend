import {Model, DataTypes} from 'sequelize';
import sequelize from '../config/dbConfig';

class Customer extends Model {
    public id!: number;
    public name!: string;
    public address?: string;
}

Customer.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Multi-line address for the customer'
        },
    },
    {
        sequelize,
        modelName: 'Customer',
        tableName: 'customers',
        timestamps: true,
    }
);

export default Customer;
