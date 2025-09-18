'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('expenses', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      jobId: {
        type: Sequelize.UUID,
        references: {
          model: 'jobs',
          key: 'id'
        }
      },
      expenseTypeId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'expense_types',
          key: 'id'
        }
      },
      operationTypeId: {
        type: Sequelize.UUID,
        references: {
          model: 'operation_types',
          key: 'id'
        }
      },
      amount: {
        type: Sequelize.DECIMAL,
        allowNull: false,
        precision: 10,
        scale: 2
      },
      description: {
        type: Sequelize.TEXT
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'on_progress'
      },
      reviewerComment: {
        type: Sequelize.TEXT
      },
      reviewedBy: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      reviewedAt: {
        type: Sequelize.DATE
      },
      paymentStatus: {
        type: Sequelize.STRING,
        defaultValue: 'pending'
      },
      operations: {
        type: Sequelize.BOOLEAN
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
        await queryInterface.dropTable('expenses');
  }
};