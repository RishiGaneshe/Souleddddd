const { DataTypes }= require('sequelize')
const { sequelize }= require('../services/connection.js')


const OTP= sequelize.define('otp', {
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    otp: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
},{
   tableName: 'OTP',
   timestamps: true
})


module.exports= OTP;