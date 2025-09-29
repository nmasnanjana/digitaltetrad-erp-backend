import {Model, DataTypes} from 'sequelize';
import sequelize from '../config/dbConfig';

interface EricssonBoqItemAttributes {
    id: number;
    boq_id: number;
    service_number: string;
    item_description: string;
    uom: string;
    qty: number;
    unit_price: number;
    total_amount: number;
    is_additional_work: boolean;
    rate_card_id?: number | null;
    is_invoiced: boolean;
    uploaded_at?: Date;
    uploaded_by?: string | null;
}

interface EricssonBoqItemCreationAttributes extends Omit<EricssonBoqItemAttributes, 'id'> {
    id?: number;
}

class EricssonBoqItem extends Model<EricssonBoqItemAttributes, EricssonBoqItemCreationAttributes> implements EricssonBoqItemAttributes {
    public id!: number;
    public boq_id!: number;
    public service_number!: string;
    public item_description!: string;
    public uom!: string;
    public qty!: number;
    public unit_price!: number;
    public total_amount!: number;
    public is_additional_work!: boolean;
    public rate_card_id?: number | null;
    public is_invoiced!: boolean;
    public uploaded_at?: Date;
    public uploaded_by?: string | null;
}

EricssonBoqItem.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        boq_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'ericsson_boqs',
                key: 'id'
            }
        },
        service_number: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        item_description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        uom: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        qty: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                min: 0
            }
        },
        unit_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0,
            validate: {
                min: 0
            }
        },
        total_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0,
            validate: {
                min: 0
            }
        },
        is_additional_work: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        rate_card_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'ericsson_rate_cards',
                key: 'id'
            }
        },
        is_invoiced: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
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
        modelName: 'EricssonBoqItem',
        tableName: 'ericsson_boq_items',
        timestamps: true,
    }
);

export default EricssonBoqItem; 