'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('SpotImages', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            spotId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'spots', // Ensure this matches the name of your spots table
                    key: 'id',
                },
            },
            url: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            preview: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        }, options);
    },

    down: async (queryInterface, Sequelize) => {
      console.log('SpotImages down');
        options.tableName = 'SpotImages';
        await queryInterface.dropTable('SpotImages');
    },
};