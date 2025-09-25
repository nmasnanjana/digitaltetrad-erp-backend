'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('ericsson_boqs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      job_id: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      project: {
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
      purchase_order_number: {
        type: Sequelize.STRING,
        allowNull: false
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
    await queryInterface.dropTable('ericsson_boqs');
  }
};