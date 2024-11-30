const crypto= require('crypto')
const validator = require('validator')
const sgMail = require('@sendgrid/mail')
const OTP= require('../models/Otp.js')
const UserAndPassword= require("../models/userAndPassword.js")
const UserData= require('../models/userDataDetails.js')
const { hashPassword, verifyPassword }= require('../services/passHashing.js')
const { tokenJWT, tokenVerification }= require('../services/jwt.js')
const { redisClient }= require('../services/connection.js')
const redisURL='redis://172.22.138.48:6379'
const client = redisClient(redisURL);
const secret= '1234567890dhdsbsjbsbbsbjcscs'; 



sgMail.setApiKey('')


exports.emailAuthentication= async(req,res)=>{
    try{
       const { email }=req.body;
       if(!email)  { return res.status(400).json({msg : "Email is required"})}
  
       const isValidEmail = validator.isEmail(email);
       if (!isValidEmail) return res.status(400).json({msg : "Email is required"})
           
       const otp= crypto.randomInt(100000,999999).toString();
       const sendOTP = async (to, otp) => {
            const msg = {
              to: to,
              from: 'studenthub33@gmail.com',
              subject: 'Your OTP Code',
              text: `Your OTP is: ${otp}`,
            };
        
            try {
                await sgMail.send(msg);
                console.log('OTP sent successfully');
                const savedOTP= await OTP.create({
                    email: to,
                    otp: otp
                })
                if(!savedOTP){
                    return res.status(500).json({msg : "Internal Server Error"})
                }
            } catch (error) {
                console.error('Error sending OTP:', error)
            }
        }

        await sendOTP(email, otp)
        return res.status(200).json({msg : "OTP sent successfully.", email: email})
      }
    catch(err){
        console.log(err)
        return res.status(500).json({msg : "Internal Server Error"})
    }
  }


  exports.handlePostOTP= async (req, res)=>{
    try{
        const { username, password, email, otp}= req.body
        if(!username || !password || !email || !otp) return res.status(400).json({msg: "all feilds are required"})

        const isValidUsername = /^[a-zA-Z0-9_-]{3,16}$/.test(username);
        const isValidEmail = validator.isEmail(email);
        const isValidOtp = /^\d{6}$/.test(otp);

        if (!isValidUsername || !isValidEmail || !isValidOtp ) return res.status(400).json({msg: "Invalid Input formate."})
        
        const result = await OTP.findOne({
            where: {
                    email: email,
                    otp: otp,
            },
        })
        if(!result){
            return res.status(400).json({msg: "Invalid OTP"})
        }
        const hashedPassword= await hashPassword(password)
        const id= crypto.randomInt(10000000,99999999)
        const newUser= await UserAndPassword.create({id: id, username: username, password: hashedPassword})
        if(newUser){
            const newUserData= await UserData.create({ username: username, email: email})
            if( newUserData) console.log("New user Created.")
        }
        const deleteOtp = await OTP.destroy({
            where: {
                email: email,
                otp: otp,
            },
        })
        if(deleteOtp>0){  console.log("OTP deleted from database")  }
        return res.status(200).json({ msg: "User Created Successfully.", name: username})

    }catch(err){
        console.log(err)
        return res.status(500).json({msg : "Internal Server Error"})
    }
  }


  exports.handlePostUserLogin= async(req,res)=>{
    try{
        const { username, password}= req.body
        if(!username || !password) {  return res.status(400).json({ msg:'Both fields are required'})  }

        const isValidUsername = /^[a-zA-Z0-9_-]{3,16}$/.test(username)
        if (!isValidUsername) return res.status(400).json({msg :"Invalid Username format"})

        const user = await UserAndPassword.findOne({
            where: {
                    username: username,
            },
        })
        if(!user) return res.status(401).json({ msg: "Incorrect username or password"})
        const match= await verifyPassword(password,user.password)

        if(!match) { return res.status(401).json({ msg: "Incorrect username or password."}) }
        const id= user.id
        const token= await tokenJWT(id, username, secret)
        console.log(`user ${user.username} logged-in`)

        return res.status(200).json({ msg :token})
    }catch(err){
        console.log(err)
        return res.status(500).json({msg : "Internal Server Error"})
    }
  }


  exports.handlePostUpdateUserData= async (req, res)=>{
    try{
        const { name, lastname, phone, address, birthDate}= req.body
        const { username }= req.user

        const User= await UserData.findOne({ where:{username: username},})
        if(!User){
            return res.status(404).json({ message: 'User not found' });
        }

        const updatedUser= await User.update({
            name: name,
            lastname: lastname,
            phone: phone, 
            address: address, 
            birthDate: birthDate
        },
        {
            where: {
                username: username,
            }
        })
        if(updatedUser){
            console.log("User Data updated")
        }
        return res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    }catch(err){
        console.log(err)
        return res.status(500).json({msg : "Internal Server Error"})
    }
  }


  exports.handlePostEmailForOtp= async(req, res)=>{
    try{
        const { username }=req.body;
        if(!username)  { return res.status(400).json({msg : "Username is required"})}

        const result = await UserData.findOne({
            where: {
                    username: username,
            },
        })
        
        const email= result.email
         
        const otp= crypto.randomInt(100000,999999).toString();
        const sendOTP = async (to, otp) => {
             const msg = {
               to: to,
               from: 'studenthub33@gmail.com',
               subject: 'Your OTP Code for password reset.',
               text: `Your OTP for password reset is: ${otp}. Do not Share this with anyone.`,
             };
         
             try {
                 await sgMail.send(msg);
                 console.log('OTP sent successfully');
                 const savedOTP= await OTP.create({
                     email: to,
                     otp: otp
                 })
                 if(!savedOTP){
                     return res.status(500).json({msg : "Internal Server Error"})
                 }
             } catch (error) {
                 console.error('Error sending OTP:', error)
             }
         }
 
         await sendOTP(email, otp)
         return res.status(200).json({msg : "OTP sent successfully.", email: email})
       }
     catch(err){
         console.log(err)
         return res.status(500).json({msg : "Internal Server Error"})
     }
  }


  exports.handlePostForgetPassword= async(req,res)=>{
    try{
        const { email, otp, password}= req.body
        if(!password || !email || !otp) return res.status(400).json({msg: "all fields are required"})

        const isValidEmail = validator.isEmail(email);
        const isValidOtp = /^\d{6}$/.test(otp);

        if (!isValidEmail || !isValidOtp ) return res.status(400).json({msg: "Invalid Input formate."})

        const result = await OTP.findOne({
            where: {
                    email: email,
                    otp: otp,
            },
        })
        if(!result){
            return res.status(400).json({msg: "Invalid OTP"})
        }
         
        const result02= await UserData.findOne({
            where :{
                email: email
            }
        })
        const username= result02.username
        const hashedPassword= await hashPassword(password)
        const User= await UserAndPassword.findOne({ where:{username: username},})
        if(!User){
            return res.status(404).json({ message: 'User not found' });
        }
        const updatedUser= await User.update({
            password: hashedPassword
        },
        {
            where: {
                username: username,
            }
        })
        if(updatedUser){
            console.log(`Password updated successfully for user ${username}`)
        }
        return res.status(200).json({ msg: "Password Updated successfully."})

    }catch(err){
        console.log(err)
        return res.status(500).json({msg : "Internal Server Error"})
    }
  }


  exports.handleGetLogout= async(req, res)=>{
    try{
        const token= req.token
        if(!token) {return res.status(401).json({ msg: "No token available."})}

        const decoded= await tokenVerification(token,secret)
        const expirationTime = decoded.exp - Math.floor(Date.now() / 1000)
        await client.set(token,'blacklisted','EX',expirationTime)

        console.log(`User ${decoded.username} Logged-Out`)
        return res.status(200).json({ msg: "User logout successfull."})
    }catch(err){
        console.log(err)
        return res.status(500).json({msg : "Internal Server Error"})
    }
  }
