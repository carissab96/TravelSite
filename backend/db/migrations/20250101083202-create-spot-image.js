'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}
module.exports = {
    async up (queryInterface, Sequelize) {
        await queryInterface.createTable("SpotImages", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            spotId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "Spots", 
                    key: "id",
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
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
        }, options);
    },

    async down (queryInterface, Sequelize){
        options.tableName = "SpotImages";
        const schema = process.env.NODE_ENV === 'production' ? process.env.SCHEMA : '';
        const schemaPrefix = schema ? `${schema}.` : '';
        
        // Drop foreign key constraint first
        await queryInterface.sequelize.query(`
            ALTER TABLE ${schemaPrefix}"SpotImages" 
            DROP CONSTRAINT IF EXISTS "SpotImages_spotId_fkey";
        `);
        
        // Then drop the table
        await queryInterface.dropTable(options);
    },
};