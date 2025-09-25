'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('ericsson_boq_remove_materials', {
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
      sl_no: {
        type: Sequelize.STRING,
        allowNull: false
      },
      material_description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      qty: {
        type: Sequelize.STRING,
        allowNull: false
      },
      remarks: {
        type: Sequelize.TEXT,
        allowNull: true
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
    await queryInterface.dropTable('ericsson_boq_remove_materials');
  }
};