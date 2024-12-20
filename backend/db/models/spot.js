const { DataTypes } = require('sequelize'); // Import DataTypes from Sequelize
const sequelize = require('../../config/database.js'); // Ensure this path is correct

module.exports = (sequelize, DataTypes) => {
    const spot = sequelize.define('spot', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        ownerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        city: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        state: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        country: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
            },  
        },
        lat: {
            type: DataTypes.FLOAT,
            allowNull: false,
            validate: {
                isNumeric: true,
            },
        },
        lng: {
            type: DataTypes.FLOAT,
            allowNull: false,
            validate: {
                isNumeric: true,
            },
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: false,
            validate: {
                isNumeric: true,
            },
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            validate: {
                isDate: true,
            },
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            validate: {
                isDate: true,
            },
        },
    }, {
        tableName: 'spots', // Specify the table name
    });

    return spot; // Return the spot model
};