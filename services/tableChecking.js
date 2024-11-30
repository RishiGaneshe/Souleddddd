const School = require('../models/school.js');
const OTP= require('../models/Otp.js')
const UserData= require('../models/userDataDetails.js')
const UserAndPassword= require("../models/userAndPassword.js")
const Medicine= require('../models/medicine.js')

exports.syncModels= async ()=>{
  try {
    await School.sync()
    await OTP.sync()
    await UserData.sync()
    await UserAndPassword.sync()
    await Medicine.sync()
    console.log('The tables has been created (if they did not already exist).');
  } catch (error) {
    console.log('Error creating the tables:', error);
  }
}


