'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('zte_rate_cards', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      code: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Product/Service code'
      },
      item: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Item description'
      },
      unit: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Unit of measurement'
      },
      price: {
        type: Sequelize.FLOAT,
        allowNull: false,
        comment: 'Price per unit'
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
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('zte_rate_cards');
  }
};