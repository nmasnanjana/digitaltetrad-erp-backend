'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add missing columns to teams table
    await queryInterface.addColumn('teams', 'description', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('teams', 'isActive', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('teams', 'description');
    await queryInterface.removeColumn('teams', 'isActive');
  }
};
