import { Model, DataTypes } from 'sequelize';
import { Op } from 'sequelize';
import sequelize from '../config/dbConfig';

// Define the return cause enum
export enum ReturnCause {
    FAULTY = 'faulty',
    REMOVED = 'removed',
    SURPLUS = 'surplus'
}

class Inventory extends Model {
    public id!: string;
    public name!: string;
    public description?: string;
    public serialNumber?: string;
    public quantity!: number;
    public unitPrice!: number;
    public isReturnItem!: boolean;
    public returnCause?: ReturnCause;
    public arStatus!: string;
    public mrnStatus!: string;
    public isReturnedToWarehouse!: boolean;
    public returnedToWarehouseAt?: Date;
    public jobId?: string;
    public createdAt!: Date;
    public updatedAt!: Date;
}

Inventory.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        serialNumber: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            validate: {
                min: 0
            }
        },
        unitPrice: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0,
            validate: {
                min: 0
            }
        },
        isReturnItem: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        returnCause: {
            type: DataTypes.ENUM(...Object.values(ReturnCause)),
            allowNull: true,
            validate: {
                isValidReturnCause(value: any) {
                    if (this.isReturnItem && !value) {
                        throw new Error('Return cause is required for return items');
                    }
                }
            }
        },
        arStatus: {
            type: DataTypes.STRING(255),
            allowNull: false,
            defaultValue: '',
        },
        mrnStatus: {
            type: DataTypes.STRING(255),
            allowNull: false,
            defaultValue: '',
        },
        isReturnedToWarehouse: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        returnedToWarehouseAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        jobId: {
            type: DataTypes.STRING,
            allowNull: true,
            references: {
                model: 'jobs',
                key: 'id'
            },
            validate: {
                async validateJobAssociation(value: string | null) {
                    if (value) {
                        const job = await sequelize.models.Job.findByPk(value);
                        if (!job) {
                            throw new Error('Invalid job ID');
                        }
                    }
                }
            }
        }
    },
    {
        sequelize,
        modelName: 'Inventory',
        tableName: 'inventory',
        timestamps: true,
        indexes: [
            {
                name: 'inventory_job_id_fk',
                fields: ['jobId'],
            },
            {
                name: 'inventory_serial_number_idx',
                fields: ['serialNumber'],
                unique: true,
                where: {
                    serialNumber: {
                        [Op.ne]: null
                    }
                }
            }
        ],
        hooks: {
            beforeUpdate: async (instance: Inventory) => {
                // If item is marked as returned to warehouse, set the timestamp
                if (instance.changed('isReturnedToWarehouse') && instance.isReturnedToWarehouse) {
                    instance.returnedToWarehouseAt = new Date();
                }
            }
        }
    }
);

export default Inventory; 