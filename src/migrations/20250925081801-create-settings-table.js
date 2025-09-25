'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('settings', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      company_name: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Company Name'
      },
      company_logo: {
        type: Sequelize.TEXT('long'),
        allowNull: true,
        comment: 'Base64 encoded company logo'
      },
      company_address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      company_phone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      company_email: {
        type: Sequelize.STRING,
        allowNull: true
      },
      currency: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'LKR'
      },
      timezone: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Asia/Colombo'
      },
      date_format: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'DD/MM/YYYY'
      },
      time_format: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '24'
      },
      language: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'en'
      },
      theme: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'light'
      },
      email_notifications: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      sms_notifications: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      auto_backup: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      backup_frequency: {
        type: Sequelize.ENUM('daily', 'weekly', 'monthly'),
        allowNull: false,
        defaultValue: 'daily'
      },
      maintenance_mode: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      maintenance_message: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdBy: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      updatedBy: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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