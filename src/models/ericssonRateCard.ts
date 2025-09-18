import {Model, DataTypes} from 'sequelize';
import sequelize from '../config/dbConfig';

interface EricssonRateCardAttributes {
    id: number;
    product_code: string;
    product_description: string;
    product_rate: number;
    uploaded_at?: Date;
    uploaded_by?: string | null;
}

interface EricssonRateCardCreationAttributes extends Omit<EricssonRateCardAttributes, 'id'> {
    id?: number;
}

class EricssonRateCard extends Model<EricssonRateCardAttributes, EricssonRateCardCreationAttributes> implements EricssonRateCardAttributes {
    public id!: number;
    public product_code!: string;
    public product_description!: string;
    public product_rate!: number;
    public uploaded_at?: Date;
    public uploaded_by?: string | null;
}

EricssonRateCard.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        product_code: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        product_description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        product_rate: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                min: 0
            }
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
        modelName: 'EricssonRateCard',
        tableName: 'ericsson_rate_cards',
        timestamps: true,
    }
);

export default EricssonRateCard; 