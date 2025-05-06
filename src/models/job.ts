import {Model, DataTypes} from 'sequelize';
import sequelize from '../config/dbConfig';
import Team from './team';
import Customer from './customer';

class Job extends Model {
    public id!: number;
    public name!: string;
    public status!: 'open' | 'in progress' | 'installed' | 'qc' | 'pat' | 'closed';
    public type!: 'supply and installation' | 'installation' | 'maintenance';
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
            type: DataTypes.ENUM('open','in progress' ,'installed', 'qc', 'pat', 'closed'),
            allowNull: false,
            defaultValue: 'open',
        },
        type: {
            type: DataTypes.ENUM('supply and installation', 'installation', 'maintenance'),
            allowNull: false,
        },
        team_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Team,
                key: 'id',
            },
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE',
        },
        customer_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Customer,
                key: 'id',
            },
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE',
        },
    },
    {
        sequelize,
        modelName: 'Job',
        tableName: 'jobs',
        timestamps: true,
        indexes: [
            {
                name: 'jobs_team_id_fk',
                fields: ['team_id'],
            },
            {
                name: 'jobs_customer_id_fk',
                fields: ['customer_id'],
            },
        ],
    }
);

export default Job;
