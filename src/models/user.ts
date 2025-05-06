import {Model, DataTypes} from 'sequelize';
import sequelize from '../config/dbConfig';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();
const saltRounds = parseInt(process.env.SALT_ROUNDS || '10', 10);

class User extends Model {
    public id!: string;
    public firstName!: string;
    public lastName!: string;
    public username!: string;
    public password!: string;
    public role!: 'admin' | 'user' | 'viewer' | 'developer';
    public email?: string;
    public isActive!: boolean;
    public lastLogin?: Date;
}

User.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM('admin', 'user', 'viewer', 'developer'),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        lastLogin: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        timestamps: true,
    }
);

// Hash password before saving
User.beforeCreate(async (user) => {
    user.password = await bcrypt.hash(user.password, saltRounds);
});

User.beforeUpdate(async (user) => {
    if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, saltRounds);
    }
});

export default User;