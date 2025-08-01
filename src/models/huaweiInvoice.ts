import {Model, DataTypes} from 'sequelize';
import sequelize from '../config/dbConfig';
import HuaweiPo from './huaweiPo';

interface HuaweiInvoiceAttributes {
    id: number;
    invoice_no: string;
    huawei_po_id: number;
    invoiced_percentage: number;
    vat_percentage: number;
    vat_amount: number;
    subtotal_amount: number;
    total_amount: number;
}

interface HuaweiInvoiceCreationAttributes extends Omit<HuaweiInvoiceAttributes, 'id'> {
    id?: number;
}

class HuaweiInvoice extends Model<HuaweiInvoiceAttributes, HuaweiInvoiceCreationAttributes> implements HuaweiInvoiceAttributes {
    public id!: number;
    public invoice_no!: string;
    public huawei_po_id!: number;
    public invoiced_percentage!: number;
    public vat_percentage!: number;
    public vat_amount!: number;
    public subtotal_amount!: number;
    public total_amount!: number;
}

HuaweiInvoice.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        invoice_no: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        huawei_po_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: HuaweiPo,
                key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
        invoiced_percentage: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
            validate: {
                min: 0,
                max: 100
            }
        },
        vat_percentage: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
            validate: {
                min: 0,
                max: 100
            }
        },
        vat_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                min: 0
            }
        },
        subtotal_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                min: 0
            }
        },
        total_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                min: 0
            }
        },
    },
    {
        sequelize,
        modelName: 'HuaweiInvoice',
        tableName: 'huawei_invoices',
        timestamps: true,
    }
);

export default HuaweiInvoice; 