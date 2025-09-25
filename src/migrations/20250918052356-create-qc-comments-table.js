'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('qc_comments', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      jobId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'jobs',
          key: 'id'
        }
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      commentType: {
        type: Sequelize.STRING,
        allowNull: false
      },
      severity: {
        type: Sequelize.STRING,
        defaultValue: 'medium'
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'open'
      },
      reportedBy: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      resolvedBy: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      resolvedAt: {
        type: Sequelize.DATE
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
        await queryInterface.dropTable('qc_comments');
  }
};