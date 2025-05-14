import {Model, DataTypes} from 'sequelize';
import sequelize from '../config/dbConfig';

class Job extends Model {
    declare id: string;
    declare name: string;
    declare status: 'open' | 'in progress' | 'installed' | 'qc' | 'pat' | 'closed';
    declare type: 'supply and installation' | 'installation' | 'maintenance';
    declare team_id: number;
    declare customer_id: number;
    declare createdAt: Date;
    declare updatedAt: Date;
}

Job.init(
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
            unique: true,
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
                model: 'teams',
                key: 'id',
            },
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE',
        },
        customer_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'customers',
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
