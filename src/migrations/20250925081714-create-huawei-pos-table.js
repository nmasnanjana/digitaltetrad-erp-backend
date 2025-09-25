'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('huawei_pos', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      job_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'jobs',
          key: 'id'
        }
      },
      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'customers',
          key: 'id'
        }
      },
      site_code: {
        type: Sequelize.STRING,
        allowNull: false
      },
      site_id: {
        type: Sequelize.STRING,
        allowNull: false
      },
      site_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      po_no: {
        type: Sequelize.STRING,
        allowNull: false
      },
      line_no: {
        type: Sequelize.STRING,
        allowNull: false
      },
      item_code: {
        type: Sequelize.STRING,
        allowNull: false
      },
      item_description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      unit_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      requested_quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      invoiced_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0
      },
      file_path: {
        type: Sequelize.STRING,
        allowNull: true
      },
      uploaded_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      uploaded_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
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
    await queryInterface.dropTable('huawei_pos');
  }
};