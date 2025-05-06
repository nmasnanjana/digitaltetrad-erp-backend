import {Model, DataTypes} from 'sequelize';
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
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
    },
    {
        sequelize,
        modelName: 'TeamAssignment',
        tableName: 'team_assignments',
        timestamps: false,
        indexes: [
            {
                name: 'team_assignments_team_id_fk',
                fields: ['team_id'],
            },
            {
                name: 'team_assignments_user_id_fk',
                fields: ['user_id'],
            },
        ],
    }
);

export default TeamAssignment;