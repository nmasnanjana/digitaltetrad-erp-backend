import {Model, DataTypes} from 'sequelize';
import sequelize from '../config/dbConfig';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Role from './role';

dotenv.config();
const saltRounds = parseInt(process.env.SALT_ROUNDS || '10', 10);

interface UserAttributes {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    password: string;
    roleId: string;
    email?: string;
    isActive: boolean;
    lastLogin?: Date;
}

interface UserCreationAttributes extends Omit<UserAttributes, 'id' | 'lastLogin' | 'isActive'> {
    id?: string;
    lastLogin?: Date;
    isActive?: boolean;
}

interface UserInstance extends Model<UserAttributes, UserCreationAttributes>, UserAttributes {
    role?: Role;
}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: string;
    public firstName!: string;
    public lastName!: string;
    public username!: string;
    public password!: string;
    public roleId!: string;
    public email?: string;
    public isActive!: boolean;
    public lastLogin?: Date;
    public role?: Role;
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
        roleId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'roles',
                key: 'id'
            }
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