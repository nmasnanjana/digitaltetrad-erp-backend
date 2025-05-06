import {Model, DataTypes} from 'sequelize';
import sequelize from '../config/dbConfig';
import Job from './job';
import User from './user';

class QCComment extends Model {
    public id!: number;
    public job_id!: number;
    public user_id!: string;
    public description!: string;
}

QCComment.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        job_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Job,
                key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: User,
                key: 'id',
            },
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE',
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'QCComment',
        tableName: 'qc_comments',
        timestamps: true,
        indexes: [
            {
                name: 'qc_comments_job_id_fk',
                fields: ['job_id'],
            },
            {
                name: 'qc_comments_user_id_fk',
                fields: ['user_id'],
            },
        ],
    }
);

export default QCComment;
