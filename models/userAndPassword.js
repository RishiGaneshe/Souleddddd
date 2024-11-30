const { DataTypes }= require('sequelize')
const { sequelize }= require('../services/connection.js')


const UserAndPassword=  sequelize.define('userandpassword',{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
      },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
})


module.exports= UserAndPassword