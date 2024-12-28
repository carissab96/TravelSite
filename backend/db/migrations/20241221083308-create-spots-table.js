'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.createTable('spots', {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        ownerId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'Users', // Assuming you have a users table
            key: 'id',
          },
          onDelete: 'CASCADE', // If a user is deleted, their spots will also be deleted
        },
        address: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        city: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        state: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        country: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        lat: {
          type: Sequelize.FLOAT,
          allowNull: false,
          validate: {
            min: -90,
            max: 90,
          },
        },
        lng: {
          type: Sequelize.FLOAT,
          allowNull: false,
          validate: {
            min: -180,
            max: 180,
          },
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
          validate: {
            len: [1, 50], // Name must be between 1 and 50 characters
          },
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        price: {
          type: Sequelize.FLOAT,
          allowNull: false,
          validate: {
            min: 0, // Price must be a positive number
          },
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      });
    },
  
    down: async (queryInterface, Sequelize) => {
      await queryInterface.dropTable('spots');
    },
  };