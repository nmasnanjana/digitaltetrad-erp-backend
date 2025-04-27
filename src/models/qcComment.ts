import {Model, DataTypes, InferAttributes, InferCreationAttributes} from 'sequelize';
import sequelize from '../config/dbConfig';
import Job from './job';

class QCComment extends Model {
    public id!: number;
    public job_id!: number;
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
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'QCComment',
        timestamps: true,
        createdAt: true,
        updatedAt: true,
    }
);

export default QCComment;
