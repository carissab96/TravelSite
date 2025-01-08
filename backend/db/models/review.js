'use strict';
const { Model, Validator } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Review extends Model {

    static associate(models) {

     Review.belongsTo(models.Spot, {
       foreignKey: 'spotId',
       onDelete: 'CASCADE',
     });

     Review.belongsTo(models.User, {
       foreignKey: 'userId',
       onDelete: 'CASCADE',
     });   

     Review.hasMany(models.ReviewImage, {
       foreignKey: 'reviewId',
       onDelete: 'CASCADE',
     });

   }
  }
  Review.init({
    spotId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Spots',
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5  
      },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Review',
  });

  return Review;
};