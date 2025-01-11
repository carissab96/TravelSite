'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}
module.exports = {
    async up (queryInterface, Sequelize) {
        await queryInterface.createTable("ReviewImages", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      reviewId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Reviews',
          key: 'id',
        },
      },
      image_url: {
        type: Sequelize.STRING,
        allowNull: false,
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
          }, options);
      },
  
      async down (queryInterface, Sequelize){
        console.log('ReviewImages down');
          options.tableName = "ReviewImages";
          await queryInterface.dropTable(options.tableName);
      },
  };