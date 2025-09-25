'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('huawei_pos', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      jobId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'jobs',
          key: 'id'
        }
      },
      poNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      poDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      totalAmount: {
        type: Sequelize.DECIMAL,
        allowNull: false,
        precision: 10,
        scale: 2
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'pending'
      },
      deliveryDate: {
        type: Sequelize.DATE
      },
      notes: {
        type: Sequelize.TEXT
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
        await queryInterface.dropTable('huawei_pos');
  }
};