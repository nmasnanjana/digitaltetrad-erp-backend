import {Model, DataTypes, InferAttributes, InferCreationAttributes} from 'sequelize';
import sequelize from '../config/dbConfig';
import User from "./user";
import Team from "./team";

class TeamAssignment extends Model {
    public id!: number;
    public team_id!: number;
    public user_id!: string;
}

TeamAssignment.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        team_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Team,
                key: 'id',
            },
        },
        user_id: {
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
        modelName: 'TeamAssignment',
    }
);

export default TeamAssignment;