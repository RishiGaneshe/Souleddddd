const express= require('express')
const cors= require('cors')
const { redisClient, sequelize} = require('./services/connection.js')
const { syncModels }= require('./services/tableChecking.js')
const User= require('./routes/user.routes.js')


const app= express()
const PORT= 6000

const redisURL='redis://172.22.138.48:6379'
// redisClient(redisURL).then(()=>{console.log("Redis connected")}) ;


async function connectDatabase(){
    try{
        await sequelize.authenticate();
        console.log('MySQL connected.');
    }catch(err){
        console.log("Error in connecting database",err)
     }
  }
connectDatabase();
const client= redisClient(redisURL)
if(client){
    console.log("Redis Connected.")
}

syncModels();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended:false}))


app.use("/", User)


app.listen(PORT,()=>{console.log(`Server on ${PORT}`) })