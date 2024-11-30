const { DataTypes }= require('sequelize')
const { sequelize }= require('../services/connection.js')

const School= sequelize.define('school', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    latitude: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    longitude: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },

},{
   tableName: 'school_list',
   timestamps: true
})


module.exports= School;