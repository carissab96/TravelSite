'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    static associate(models) {
      // Define associations
      Booking.belongsTo(models.User, {
        foreignKey: 'userId'
      });
      Booking.belongsTo(models.Spot, {
        foreignKey: 'spotId'
      });
    }
  }

  Booking.init({
    spotId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { msg: 'Spot ID is required' },
        notEmpty: { msg: 'Spot ID is required' }
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { msg: 'User ID is required' },
        notEmpty: { msg: 'User ID is required' }
      }
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notNull: { msg: 'Start date is required' },
        isDate: { msg: 'Start date must be a valid date' },
        isNotPast(value) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (new Date(value) < today) {
            throw new Error('Start date cannot be in the past');
          }
        },
        isNotTooFarInFuture(value) {
          const maxDate = new Date();
          maxDate.setFullYear(maxDate.getFullYear() + 1); // Max 1 year in advance
          if (new Date(value) > maxDate) {
            throw new Error('Bookings cannot be made more than 1 year in advance');
          }
        }
      }
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notNull: { msg: 'End date is required' },
        isDate: { msg: 'End date must be a valid date' },
        isAfterStartDate(value) {
          if (new Date(value) <= new Date(this.startDate)) {
            throw new Error('End date must be after start date');
          }
        },
        isNotTooLong(value) {
          const maxStayDays = 14; // Max 2 weeks stay
          const startDate = new Date(this.startDate);
          const endDate = new Date(value);
          const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
          
          if (daysDiff > maxStayDays) {
            throw new Error(`Bookings cannot exceed ${maxStayDays} days`);
          }
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Booking',
    scopes: {
      // Scope to exclude sensitive information when returning booking data
      defaultScope: {
        attributes: {
          exclude: ['updatedAt']
        }
      }
    },
    indexes: [
      // Add indexes for common queries
      {
        fields: ['spotId']
      },
      {
        fields: ['userId']
      },
      {
        fields: ['startDate', 'endDate']
      }
    ]
  });

  return Booking;
};
