import {Model, DataTypes} from 'sequelize';
import sequelize from '../config/dbConfig';

interface ZtePoAttributes {
    id: number;
    job_id: string;
    customer_id: number;
    po_line_no: string;
    purchasing_area: string;
    site_code: string;
    site_name: string;
    logic_site_code: string;
    logic_site_name: string;
    item_code: string;
    item_name: string;
    unit: string;
    po_quantity: number;
    confirmed_quantity: number;
    settlement_quantity: number;
    quantity_bill: number;
    quantity_cancelled: number;
    unit_price: number;
    tax_rate: number;
    subtotal_excluding_tax: number;
    subtotal_including_tax: number;
    pr_line_number: string;
    description: string;
    is_invoiced: boolean;
    file_path?: string;
    uploaded_at?: Date;
    uploaded_by?: string;
}

interface ZtePoCreationAttributes extends Omit<ZtePoAttributes, 'id'> {
    id?: number;
}

class ZtePo extends Model<ZtePoAttributes, ZtePoCreationAttributes> implements ZtePoAttributes {
    public id!: number;
    public job_id!: string;
    public customer_id!: number;
    public po_line_no!: string;
    public purchasing_area!: string;
    public site_code!: string;
    public site_name!: string;
    public logic_site_code!: string;
    public logic_site_name!: string;
    public item_code!: string;
    public item_name!: string;
    public unit!: string;
    public po_quantity!: number;
    public confirmed_quantity!: number;
    public settlement_quantity!: number;
    public quantity_bill!: number;
    public quantity_cancelled!: number;
    public unit_price!: number;
    public tax_rate!: number;
    public subtotal_excluding_tax!: number;
    public subtotal_including_tax!: number;
    public pr_line_number!: string;
    public description!: string;
    public is_invoiced!: boolean;
    public file_path?: string;
    public uploaded_at?: Date;
    public uploaded_by?: string;
}

ZtePo.init(
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
        po_line_no: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        purchasing_area: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        site_code: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        site_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        logic_site_code: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        logic_site_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        item_code: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        item_name: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        unit: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        po_quantity: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0,
        },
        confirmed_quantity: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0,
        },
        settlement_quantity: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0,
        },
        quantity_bill: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0,
        },
        quantity_cancelled: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0,
        },
        unit_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0,
        },
        tax_rate: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
            defaultValue: 0,
        },
        subtotal_excluding_tax: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0,
        },
        subtotal_including_tax: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0,
        },
        pr_line_number: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        is_invoiced: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
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
        }
    },
    {
        sequelize,
        modelName: 'ZtePo',
        tableName: 'zte_pos',
        timestamps: true,
    }
);

export default ZtePo;

