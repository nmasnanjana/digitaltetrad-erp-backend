'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('ericsson_boq_surplus_materials', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      boqId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'ericsson_boqs',
          key: 'id'
        }
      },
      materialCode: {
        type: Sequelize.STRING,
        allowNull: false
      },
      materialDescription: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      unitPrice: {
        type: Sequelize.DECIMAL,
        allowNull: false,
        precision: 10,
        scale: 2
      },
      totalPrice: {
        type: Sequelize.DECIMAL,
        allowNull: false,
        precision: 10,
        scale: 2
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
        await queryInterface.dropTable('ericsson_boq_surplus_materials');
  }
};