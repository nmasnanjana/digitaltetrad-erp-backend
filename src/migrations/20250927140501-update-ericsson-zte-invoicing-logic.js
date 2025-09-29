'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Update ZTE Invoice table - remove invoiced_percentage column
    await queryInterface.removeColumn('zte_invoices', 'invoiced_percentage');

    // Update ZTE PO table - replace invoiced_percentage with is_invoiced
    await queryInterface.removeColumn('zte_pos', 'invoiced_percentage');
    await queryInterface.addColumn('zte_pos', 'is_invoiced', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });

    // Update Ericsson BOQ Item table - replace invoiced_percentage with is_invoiced
    await queryInterface.removeColumn('ericsson_boq_items', 'invoiced_percentage');
    await queryInterface.addColumn('ericsson_boq_items', 'is_invoiced', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert ZTE Invoice table - add back invoiced_percentage column
    await queryInterface.addColumn('zte_invoices', 'invoiced_percentage', {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100
      }
    });

    // Revert ZTE PO table - replace is_invoiced with invoiced_percentage
    await queryInterface.removeColumn('zte_pos', 'is_invoiced');
    await queryInterface.addColumn('zte_pos', 'invoiced_percentage', {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100
      }
    });

    // Revert Ericsson BOQ Item table - replace is_invoiced with invoiced_percentage
    await queryInterface.removeColumn('ericsson_boq_items', 'is_invoiced');
    await queryInterface.addColumn('ericsson_boq_items', 'invoiced_percentage', {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100
      }
    });
  }
};