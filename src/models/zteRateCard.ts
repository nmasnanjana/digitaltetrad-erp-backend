import {Model, DataTypes} from 'sequelize';
import sequelize from '../config/dbConfig';

interface ZteRateCardAttributes {
    id: number;
    code: string;
    item: string;
    unit: string;
    price: number;
    uploaded_at?: Date;
    uploaded_by?: string | null;
}

interface ZteRateCardCreationAttributes extends Omit<ZteRateCardAttributes, 'id'> {
    id?: number;
}

class ZteRateCard extends Model<ZteRateCardAttributes, ZteRateCardCreationAttributes> implements ZteRateCardAttributes {
    public id!: number;
    public code!: string;
    public item!: string;
    public unit!: string;
    public price!: number;
    public uploaded_at?: Date;
    public uploaded_by?: string | null;
}

ZteRateCard.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        code: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: 'Product/Service code'
        },
        item: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: 'Item description'
        },
        unit: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: 'Unit of measurement'
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: false,
            validate: {
                min: 0
            },
            comment: 'Price per unit'
        },
        uploaded_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW,
        },
        uploaded_by: {
            type: DataTypes.UUID,
            allowNull: true,
            defaultValue: null,
        }
    },
    {
        sequelize,
        modelName: 'ZteRateCard',
        tableName: 'zte_rate_cards',
        timestamps: true,
    }
);

export default ZteRateCard;
