'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Update company_logo column to LONGTEXT to handle base64-encoded images
    await queryInterface.changeColumn('settings', 'company_logo', {
      type: Sequelize.TEXT('long'),
      allowNull: true,
      comment: 'Base64 encoded company logo'
    });
  },

  async down (queryInterface, Sequelize) {
    // Revert company_logo column back to TEXT
    await queryInterface.changeColumn('settings', 'company_logo', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Base64 encoded company logo'
    });
  }
};
