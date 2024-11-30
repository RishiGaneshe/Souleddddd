const School= require('../models/school.js')
const haversine = require('haversine');


exports.handlePostSchoolData= async(req,res)=>{
  try{
      const { name, address, latitude, longitude}= req.body
      const newSchool= await School.create({
        name,
        address,
        latitude,
        longitude,
      }) 
      
      if(!newSchool){
         console.log("Error in addding new School.")
         return res.status(500).json({ msg: "Error in Adding School."})
      }
      console.log("new School added.")
      return res.status(200).json({ msg: "School added successfully."})
      
  }catch(err){
      console.log("Error in Adding School API: ", err)
      return res.status(500).json({msg: "Internal Server Error"})
  }
}


exports.handleGetSchoolDistance= async (req, res)=>{
  try{
      const { latitude, longitude } = req.query;
      
      const userCoordinates = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      }

      const schools = await School.findAll()
      const schoolsWithDistance = schools.map(school => {
        const schoolCoordinates = {
          latitude: school.latitude,
          longitude: school.longitude
        }
  
        const distance = haversine(userCoordinates, schoolCoordinates, { unit: 'km' }) 
        return {
          id: school.id,
          name: school.name,
          address: school.address,
          latitude: school.latitude,
          longitude: school.longitude,
          distance: distance 
        }
      })

      schoolsWithDistance.sort((a, b) => a.distance - b.distance);
      return res.status(200).json({ nearbySchools: schoolsWithDistance });

  }catch(err){
      console.error('Error fetching schools or calculating distances:', err);
      return res.status(500).json({ error: 'Internal server error' });
  }
}

