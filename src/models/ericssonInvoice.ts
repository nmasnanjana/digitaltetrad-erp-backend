import {Model, DataTypes} from 'sequelize';
import sequelize from '../config/dbConfig';

interface EricssonInvoiceAttributes {
    id: number;
    invoice_number: string;
    job_id: string;
    job_title: string;
    customer_name: string;
    customer_address: string;
    project: string;
    site_id: string;
    site_name: string;
    purchase_order_number: string;
    subtotal: number;
    vat_amount: number;
    ssl_amount: number;
    total_amount: number;
    vat_percentage: number;
    ssl_percentage: number;
    items?: any;
    created_by?: string;
    created_at?: Date;
}

interface EricssonInvoiceCreationAttributes extends Omit<EricssonInvoiceAttributes, 'id'> {
    id?: number;
}

class EricssonInvoice extends Model<EricssonInvoiceAttributes, EricssonInvoiceCreationAttributes> implements EricssonInvoiceAttributes {
    public id!: number;
    public invoice_number!: string;
    public job_id!: string;
    public job_title!: string;
    public customer_name!: string;
    public customer_address!: string;
    public project!: string;
    public site_id!: string;
    public site_name!: string;
    public purchase_order_number!: string;
    public subtotal!: number;
    public vat_amount!: number;
    public ssl_amount!: number;
    public total_amount!: number;
    public vat_percentage!: number;
    public ssl_percentage!: number;
    public items?: any;
    public created_by?: string;
    public created_at?: Date;
}

EricssonInvoice.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        invoice_number: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        job_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        job_title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        customer_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        customer_address: {
            type: DataTypes.TEXT,
            allowNull: true,
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
        subtotal: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
        },
        vat_amount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
        },
        ssl_amount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
        },
        total_amount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
        },
        vat_percentage: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
        },
        ssl_percentage: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
        },
        items: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        created_by: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW,
        }
    },
    {
        sequelize,
        modelName: 'EricssonInvoice',
        tableName: 'ericsson_invoices',
        timestamps: true,
    }
);

export default EricssonInvoice; 