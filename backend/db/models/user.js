'use strict';

const { Model } = require('sequelize');
const validator = require('validator');

module.exports = (sequelize, DataTypes) => {
  
  class User extends Model {
    static associate(models) {
      // Define associations with CASCADE delete
      User.hasMany(models.Spot, { 
        foreignKey: 'ownerId',
        onDelete: 'CASCADE',
        hooks: true
      });

      // Add any other associations here with CASCADE
      if (models.Review) {
        User.hasMany(models.Review, {
          foreignKey: 'userId',
          onDelete: 'CASCADE',
          hooks: true
        });
      }
    }
  }

  User.init(
    {
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [1, 30],
          notEmpty: true
        }
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [1, 30],
          notEmpty: true
        }
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          len: [4, 30],
          isNotEmail(value) {
            if (validator.isEmail(value)) {
              throw new Error('Cannot be an email.');
            }
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          len: [3, 256],
          isEmail: true,
        },
      },
      hashedPassword: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [60, 60],
        },
      },
    },
    {
      sequelize,
      modelName: 'User',
      defaultScope: {
        attributes: {
          exclude: ['hashedPassword', 'createdAt', 'updatedAt'],
        },
      },
      scopes: {
        currentUser: {
          attributes: { exclude: ['hashedPassword'] },
        },
        loginUser: {
          attributes: {},
        },
      },
    }
  );
  return User;
};