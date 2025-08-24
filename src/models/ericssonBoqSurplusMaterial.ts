import {Model, DataTypes} from 'sequelize';
import sequelize from '../config/dbConfig';

interface EricssonBoqSurplusMaterialAttributes {
    id: number;
    boq_id: number;
    sl_no: string;
    material_description: string;
    qty: string;
    remarks?: string;
    uploaded_at?: Date;
    uploaded_by?: string | null;
}

interface EricssonBoqSurplusMaterialCreationAttributes extends Omit<EricssonBoqSurplusMaterialAttributes, 'id'> {
    id?: number;
}

class EricssonBoqSurplusMaterial extends Model<EricssonBoqSurplusMaterialAttributes, EricssonBoqSurplusMaterialCreationAttributes> implements EricssonBoqSurplusMaterialAttributes {
    public id!: number;
    public boq_id!: number;
    public sl_no!: string;
    public material_description!: string;
    public qty!: string;
    public remarks?: string;
    public uploaded_at?: Date;
    public uploaded_by?: string | null;
}

EricssonBoqSurplusMaterial.init(
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
        sl_no: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        material_description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        qty: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        remarks: {
            type: DataTypes.TEXT,
            allowNull: true,
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
        modelName: 'EricssonBoqSurplusMaterial',
        tableName: 'ericsson_boq_surplus_materials',
        timestamps: true,
    }
);

export default EricssonBoqSurplusMaterial; 