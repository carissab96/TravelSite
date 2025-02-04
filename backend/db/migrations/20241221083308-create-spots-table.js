'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  
}
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Spots", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        ownerId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "Users",
            key: "id",
          },
          onDelete: 'CASCADE', 
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
      }, options);
    },
  
   async down (queryInterface, Sequelize){
      options.tableName = "Spots";
      const schema = process.env.NODE_ENV === 'production' ? process.env.SCHEMA : '';
      const schemaPrefix = schema ? `${schema}.` : '';
      
      // Drop foreign key constraint first
      await queryInterface.sequelize.query(`
        ALTER TABLE ${schemaPrefix}"Spots" 
        DROP CONSTRAINT IF EXISTS "Spots_ownerId_fkey";
      `);
      
      // Then drop the table
      await queryInterface.dropTable(options);
    },
  };