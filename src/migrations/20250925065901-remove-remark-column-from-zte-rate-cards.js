'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('zte_rate_cards', 'remark');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('zte_rate_cards', 'remark', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: '',
      comment: 'Additional remarks or notes'
    });
  }
};