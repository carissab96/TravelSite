'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Spot extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Spot.belongsTo(models.User, {
        foreignKey: 'ownerId',
        onDelete: 'CASCADE',
      });

      Spot.hasMany(models.SpotImage, {
        foreignKey: 'spotId',
        onDelete: 'CASCADE',
      });

    }
  }

  Spot.init({
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'User',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
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
        len: [1, 50], // Name must be between 1 and 50 characters
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0, // Price must be a positive number
      },
    },
  }, {
    sequelize,
    modelName: 'Spot',
  });

  return Spot;
};