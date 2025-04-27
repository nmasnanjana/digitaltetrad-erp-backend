import {Model, DataTypes, InferAttributes, InferCreationAttributes} from 'sequelize';
import sequelize from '../config/dbConfig';
import Team from './team';
import Customer from './customer';

class Job extends Model {
    public id!: number;
    public name!: string;
    public status!: 'init' | 'progress' | 'finish';
    public type!: 'device update' | 'new device install';
    public team_id!: number;
    public customer_id!: number;
}

Job.init(
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
        status: {
            type: DataTypes.ENUM('init', 'progress', 'finish'),
            allowNull: false,
            defaultValue: 'init',
        },
        type: {
            type: DataTypes.ENUM('device update', 'new device install'),
            allowNull: false,
        },
        team_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Team,
                key: 'id',
            },
        },
        customer_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Customer,
                key: 'id',
            },
        },
    },
    {
        sequelize,
        modelName: 'Job',
        timestamps: true,
        createdAt: true,
        updatedAt: true,
    }
);

export default Job;
