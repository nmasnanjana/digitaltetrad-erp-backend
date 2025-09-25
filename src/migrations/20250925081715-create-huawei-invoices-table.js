'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('huawei_invoices', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      invoice_no: {
        type: Sequelize.STRING,
        allowNull: false
      },
      huawei_po_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'huawei_pos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      invoiced_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false
      },
      vat_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false
      },
      vat_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      subtotal_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      total_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
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
    await queryInterface.dropTable('huawei_invoices');
  }
};