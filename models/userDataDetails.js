const { DataTypes }= require('sequelize')
const { sequelize }= require('../services/connection.js')


const UserData=  sequelize.define('userdata',{
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    name: {
        type: DataTypes.STRING,
    },
    lastname: {
        type: DataTypes.STRING,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phone: {
        type: DataTypes.STRING,
    },
    address: {
        type: DataTypes.STRING,
    },
    birthDate: {
        type: DataTypes.STRING,
    }
})


module.exports= UserData