import {Model, DataTypes} from 'sequelize';
import sequelize from '../config/dbConfig';

interface SettingsAttributes {
    id: number;
    currency: string;
    vat_percentage: number;
    vat_number: string;
    business_registration_number: string;
    contact_number: string;
    email: string;
    finance_email: string;
    company_name: string;
    bank_account: string;
    updated_by?: string;
}

interface SettingsCreationAttributes extends Omit<SettingsAttributes, 'id'> {}

class Settings extends Model<SettingsAttributes, SettingsCreationAttributes> implements SettingsAttributes {
    public id!: number;
    public currency!: string;
    public vat_percentage!: number;
    public vat_number!: string;
    public business_registration_number!: string;
    public contact_number!: string;
    public email!: string;
    public finance_email!: string;
    public company_name!: string;
    public bank_account!: string;
    public updated_by?: string;
}

Settings.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        currency: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'USD',
        },
        vat_percentage: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
            defaultValue: 0.00,
            validate: {
                min: 0,
                max: 100
            }
        },
        vat_number: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        business_registration_number: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        contact_number: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                isValidEmail(value: string) {
                    if (value && value.trim() !== '') {
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailRegex.test(value)) {
                            throw new Error('Please enter a valid email address');
                        }
                    }
                }
            }
        },
        finance_email: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                isValidEmail(value: string) {
                    if (value && value.trim() !== '') {
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailRegex.test(value)) {
                            throw new Error('Please enter a valid finance email address');
                        }
                    }
                }
            }
        },
        company_name: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'Company Name'
        },
        bank_account: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Multi-line bank account details'
        },
        updated_by: {
            type: DataTypes.STRING,
            allowNull: true,
        }
    },
    {
        sequelize,
        modelName: 'Settings',
        tableName: 'settings',
        timestamps: true,
    }
);

export default Settings; 