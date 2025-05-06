import {Model, DataTypes} from 'sequelize';
import sequelize from '../config/dbConfig';

class Customer extends Model {
    public id!: number;
    public name!: string;
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
    },
    {
        sequelize,
        modelName: 'Customer',
        tableName: 'customers',
        timestamps: true,
    }
);

export default Customer;
