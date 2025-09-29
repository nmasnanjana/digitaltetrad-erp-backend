import {Model, DataTypes} from 'sequelize';
import sequelize from '../config/dbConfig';
import ZtePo from './ztePo';
import User from './user';

interface ZteInvoiceAttributes {
    id: number;
    invoice_no: string;
    zte_po_id: number;
    vat_percentage: number;
    vat_amount: number;
    subtotal_amount: number;
    total_amount: number;
    created_at?: Date;
    created_by?: string;
}

interface ZteInvoiceCreationAttributes extends Omit<ZteInvoiceAttributes, 'id'> {
    id?: number;
}

class ZteInvoice extends Model<ZteInvoiceAttributes, ZteInvoiceCreationAttributes> implements ZteInvoiceAttributes {
    public id!: number;
    public invoice_no!: string;
    public zte_po_id!: number;
    public vat_percentage!: number;
    public vat_amount!: number;
    public subtotal_amount!: number;
    public total_amount!: number;
    public created_at?: Date;
    public created_by?: string;
    
    // Association properties
    public ztePo?: ZtePo;
    public creator?: User;
}

ZteInvoice.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        invoice_no: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        zte_po_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: ZtePo,
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        vat_percentage: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
            defaultValue: 0,
        },
        vat_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0,
        },
        subtotal_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0,
        },
        total_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW,
        },
        created_by: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: User,
                key: 'id'
            }
        }
    },
    {
        sequelize,
        modelName: 'ZteInvoice',
        tableName: 'zte_invoices',
        timestamps: true,
    }
);

export default ZteInvoice;


