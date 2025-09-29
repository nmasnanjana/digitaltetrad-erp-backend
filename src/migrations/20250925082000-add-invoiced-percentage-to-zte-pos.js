'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('zte_pos', 'invoiced_percentage', {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('zte_pos', 'invoiced_percentage');
  }
};

