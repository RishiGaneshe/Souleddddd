const jwt= require('jsonwebtoken');


exports.tokenJWT= async(id, username, secret)=>{
  try{
      return jwt.sign({ id , username}, secret, { expiresIn: '100m'})
  }catch(err){
      console.log(err)
  }
}


exports.tokenVerification= async(token, secret)=>{
  try{
      return jwt.verify(token, secret)
  }catch(err){
    console.log(err)
  }
}