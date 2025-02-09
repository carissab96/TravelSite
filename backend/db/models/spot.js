'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Spot extends Model {

    static associate(models) {
      // User association with Owner alias
      Spot.belongsTo(models.User, {
        foreignKey: 'ownerId',
        as: 'Owner',
        onDelete: 'CASCADE'
      });

      Spot.hasMany(models.SpotImage, {
        foreignKey: 'spotId',
        onDelete: 'CASCADE'
      });

      // Add Reviews association if not already present
      Spot.hasMany(models.Review, {
        foreignKey: 'spotId',
        onDelete: 'CASCADE'
      });
    }
  }

  Spot.init({
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 250]
      }
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 90],
        is: /^[A-Z][a-zA-Z\s]*$/
      }
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUppercase: true,
        len: [2, 2],
        is: /^[A-Z]{2}$/,
      }
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 90],// Country must be between 1 and 90 characters
      }
    },
    lat: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: -90,
        max: 90,
      },
    },
    lng: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: -180,
        max: 180,
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 50],
        is: /^[A-Z][a-zA-Z0-9\s]*$/
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [1, 500], // Description must be between 1 and 500 characters
      }
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 1, // Price must not be less than 1
      },
    },
  }, {
    sequelize,
    modelName: 'Spot',
  });

  return Spot;
};