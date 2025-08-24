import {Model, DataTypes} from 'sequelize';
import sequelize from '../config/dbConfig';

interface EricssonBoqAttributes {
    id: number;
    job_id: string;
    project: string;
    site_id: string;
    site_name: string;
    purchase_order_number: string;
    uploaded_at?: Date;
    uploaded_by?: string | null;
    items?: any[];
    materials?: any[];
}

interface EricssonBoqCreationAttributes extends Omit<EricssonBoqAttributes, 'id'> {
    id?: number;
}

class EricssonBoq extends Model<EricssonBoqAttributes, EricssonBoqCreationAttributes> implements EricssonBoqAttributes {
    public id!: number;
    public job_id!: string;
    public project!: string;
    public site_id!: string;
    public site_name!: string;
    public purchase_order_number!: string;
    public uploaded_at?: Date;
    public uploaded_by?: string | null;
    public items?: any[];
    public materials?: any[];
}

EricssonBoq.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        job_id: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        project: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        site_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        site_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        purchase_order_number: {
            type: DataTypes.STRING,
            allowNull: false,
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
        modelName: 'EricssonBoq',
        tableName: 'ericsson_boqs',
        timestamps: true,
    }
);

export default EricssonBoq; 