'use strict';
const { Model } = require('sequelize');
const validator = require('validator');

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
  
  Review.init(
    { 
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
  comment: { 
    type: DataTypes.TEXT, 
    allowNull: false, 
    validate: { 
      notEmpty: { 
        msg: 'Comment cannot be empty.',
      }, 
      len: { 
       args: [1, 255],
        msg: 'Comment must be between 1 and 255 characters.', 
      }, 
    }, 
  }, 
  stars: { 
    type: DataTypes.INTEGER, 
    allowNull: false, 
    validate: { 
      min: { 
        args: 1, 
        msg: 'Stars must be at least 1.',
      }, 
      max: { 
        args: 5, 
        msg: 'Stars must be at most 5.', 
      }, 
    }, 
  }, 
  createdAt: { 
    allowNull: false, 
    type: DataTypes.DATE, 
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP') 
  }, 
  updatedAt: { 
    allowNull: false, 
    type: DataTypes.DATE, 
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP') 
  }, 
}, 
 { 
  sequelize, 
  modelName: 'Review', 
    }
  ); 
  return Review;
};