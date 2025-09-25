'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('inventory', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      serialNumber: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      unitPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      isReturnItem: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      returnCause: {
        type: Sequelize.ENUM('faulty', 'removed', 'surplus'),
        allowNull: true
      },
      arStatus: {
        type: Sequelize.STRING(255),
        allowNull: false,
        defaultValue: ''
      },
      mrnStatus: {
        type: Sequelize.STRING(255),
        allowNull: false,
        defaultValue: ''
      },
      isReturnedToWarehouse: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      returnedToWarehouseAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      jobId: {
        type: Sequelize.STRING,
        allowNull: true,
        references: {
          model: 'jobs',
          key: 'id'
        }
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('inventory');
  }
};