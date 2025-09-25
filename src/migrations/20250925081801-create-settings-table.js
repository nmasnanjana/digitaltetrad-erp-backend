'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('settings', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      currency: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'USD'
      },
      vat_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      ssl_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      vat_number: {
        type: Sequelize.STRING,
        allowNull: true
      },
      business_registration_number: {
        type: Sequelize.STRING,
        allowNull: true
      },
      contact_number: {
        type: Sequelize.STRING,
        allowNull: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true
      },
      finance_email: {
        type: Sequelize.STRING,
        allowNull: true
      },
      company_name: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Company Name'
      },
      company_address: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Multi-line company address'
      },
      company_logo: {
        type: Sequelize.TEXT('long'),
        allowNull: true,
        comment: 'Base64 encoded company logo'
      },
      bank_account: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Multi-line bank account details'
      },
      updated_by: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable('settings');
  }
};