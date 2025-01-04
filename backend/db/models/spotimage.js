'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SpotImage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      SpotImage.belongsTo(models.Spot, {
        foreignKey: 'spotId',
        onDelete: 'CASCADE',
      });
    }
  }
  SpotImage.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
},
spotId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
        model: 'Spots', // Ensure this matches the name of your spots table
        key: 'id',
    },
},
url: {
    type: DataTypes.STRING,
    allowNull: false,
},
preview: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
},
createdAt: {
    allowNull: false,
    type: DataTypes.DATE,
    
},
updatedAt: {
    allowNull: false,
    type: DataTypes.DATE,
},
}, {
sequelize,
modelName: 'SpotImage',
});

return SpotImage;
};