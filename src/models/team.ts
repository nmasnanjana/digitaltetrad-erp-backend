import {Model, DataTypes, InferAttributes, InferCreationAttributes} from 'sequelize';
import sequelize from '../config/dbConfig';
import User from "./user";

class Team extends Model {
    public id!: number;
    public name!: string;
    public type!: 'internal' | 'external';
    public company?: string;
    public leader_id!: number;
}

Team.init(
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
        type: {
            type: DataTypes.ENUM('internal', 'external'),
            allowNull: false,
        },
        company: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        leader_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: User,
                key: 'id',
            },
        },
    },
    {
        sequelize,
        modelName: 'Team',
        timestamps: true,
        createdAt: true,
        updatedAt: true,
    }
);

export default Team;