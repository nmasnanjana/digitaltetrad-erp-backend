'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('ericsson_boq_items', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      boq_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ericsson_boqs',
          key: 'id'
        }
      },
      service_number: {
        type: Sequelize.STRING,
        allowNull: false
      },
      item_description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      uom: {
        type: Sequelize.STRING,
        allowNull: false
      },
      qty: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      unit_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      total_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      is_additional_work: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      rate_card_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'ericsson_rate_cards',
          key: 'id'
        }
      },
      invoiced_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0
      },
      uploaded_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.NOW
      },
      uploaded_by: {
        type: Sequelize.UUID,
        allowNull: true,
        defaultValue: null
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
    await queryInterface.dropTable('ericsson_boq_items');
  }
};