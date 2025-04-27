import {Model, DataTypes, InferAttributes, InferCreationAttributes} from 'sequelize';
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
        timestamps: true,
        createdAt: true,
        updatedAt: true,
    }
);

export default Customer;
