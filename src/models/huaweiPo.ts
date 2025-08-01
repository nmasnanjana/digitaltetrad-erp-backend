import {Model, DataTypes} from 'sequelize';
import sequelize from '../config/dbConfig';

interface HuaweiPoAttributes {
    id: number;
    job_id: string;
    customer_id: number;
    site_code: string;
    site_id: string;
    site_name: string;
    po_no: string;
    line_no: string;
    item_code: string;
    item_description: string;
    unit_price: number;
    requested_quantity: number;
    invoiced_percentage: number;
    file_path?: string;
    uploaded_at?: Date;
    uploaded_by?: string;
}

interface HuaweiPoCreationAttributes extends Omit<HuaweiPoAttributes, 'id'> {
    id?: number;
}

class HuaweiPo extends Model<HuaweiPoAttributes, HuaweiPoCreationAttributes> implements HuaweiPoAttributes {
    public id!: number;
    public job_id!: string;
    public customer_id!: number;
    public site_code!: string;
    public site_id!: string;
    public site_name!: string;
    public po_no!: string;
    public line_no!: string;
    public item_code!: string;
    public item_description!: string;
    public unit_price!: number;
    public requested_quantity!: number;
    public invoiced_percentage!: number;
    public file_path?: string;
    public uploaded_at?: Date;
    public uploaded_by?: string;
}

HuaweiPo.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        job_id: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: 'jobs',
                key: 'id',
            },
        },
        customer_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'customers',
                key: 'id',
            },
        },
        site_code: {
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
        po_no: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        line_no: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        item_code: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        item_description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        unit_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        requested_quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        invoiced_percentage: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
            defaultValue: 0,
            validate: {
                min: 0,
                max: 100
            }
        },
        file_path: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        uploaded_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        uploaded_by: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id',
            },
        },
    },
    {
        sequelize,
        modelName: 'HuaweiPo',
        tableName: 'huawei_pos',
        timestamps: true,
    }
);

export default HuaweiPo; 