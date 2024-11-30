const secret= '1234567890dhdsbsjbsbbsbjcscs'; 
const { redisClient }= require('../services/connection.js')
const { tokenVerification }= require('../services/jwt.js')
const redisURL='redis://172.22.138.48:6379'
const client = redisClient(redisURL);

if(client){
    console.log("Redis is connected.")
}

exports.handleJwtAuthentication= async(req, res, next)=>{
  try{
      const authHeader = req.headers['authorization']
      if (!authHeader) {
        return res.status(401).json({ msg: 'Authorization header is missing' });
      }

      const token = authHeader.split(' ')[1]
      if(!token) {
        return res.status(401).json({ msg: 'JWT token is missing' });
      }

      const blacklisted= await client.get(token)
      if(blacklisted) {
        return res.status(401).json({ msg: 'JWT token is Blacklisted' });
      }

      const decoded= await tokenVerification(token, secret)
      req.token= token
      req.user= decoded
      next();
  }catch(err){
      console.log("Error in Authentication middleware: ",err)
      return res.status(500).json({msg: "Internal Server Error"})
  }
}