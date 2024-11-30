const { redisClient }= require('../services/connection.js')
const redisURL='redis://172.22.138.48:6379'
const client = redisClient(redisURL);
const Medicines= require('../models/medicine.js')



exports.handleGetAllMedicine= async(req, res)=>{
  try{
      const cacheKey01= `updated-med` 
      const medicines= await client.get(cacheKey01)
       if(medicines){
          console.log("Data from cache.")
          return res.status(200).json({allMedicines: JSON.parse(medicines)})
       }
      const allMedicines= await Medicines.findAll();
      if (!allMedicines){ return res.status(500).json({ msg: "Unable to send data. Server side error."})}
      return res.status(200).json({allMedicines: allMedicines})
  }catch(err){
      console.log(err)
      return res.status(500).json({msg : "Internal Server Error"})
  }
}


exports.handlePostAddMedicines= async(req, res)=>{
  try{
      const { medicine_name, manufacturer, category, price, quantity, expiryDate, batchNumber } = req.body
      const user_id= req.user.id
    
      if (!user_id || !medicine_name || !price || !quantity || !expiryDate || !batchNumber) {
        return res.status(400).json({ msg: 'Missing required fields' });
      }
       
      const newMedicine= await Medicines.create({
        user_id: user_id,
        medicine_name: medicine_name,
        manufacturer: manufacturer,
        category: category,
        price: price,
        quantity: quantity,
        expiryDate: expiryDate,
        batchNumber: batchNumber
      })
      
      if(!newMedicine){ return res.status(500).json({msg: "Unable to add medicines."})}

      const cacheKey= `addMed-${newMedicine.medicine_id}`
      await client.set(cacheKey, updatedMedicine,'EX', 3600)
      
      console.log(`New Medicine ${medicine_name} added.`)   
      res.status(200).json({ msg: "Medicine added successfully.", medicine: newMedicine})
       
      const allMedicines= await Medicines.findAll();
      const allMedicinesJSON = JSON.stringify(allMedicines.map(med => med.toJSON()));
      const cacheKey01= `updated-med`
      await client.set(cacheKey01, allMedicinesJSON,'EX', 3600)
  }catch(err){
      console.log(err)
      return res.status(500).json({msg : "Internal Server Error"})
  }
}


exports.handlePostUpdateMedicineData= async (req,res)=>{
  try{
      const { medicine_id, medicine_name, user_id, manufacturer, category, price, quantity, expiryDate, batchNumber }= req.body
      const medicine = await Medicines.findByPk(medicine_id)

      if (!medicine) { return res.status(404).json({ msg: 'Medicine not found' })  }

      const updatedMedicine = await medicine.update({
        medicine_name: medicine.medicine_name,
        medicine_id: medicine.medicine_id,
        user_id: req.user.id || user_id,
        quantity: quantity || medicine.quantity,
        price: price || medicine.price,
        manufacturer: manufacturer || medicine.manufacturer,
        category: category || medicine.category,
        expiryDate: expiryDate ||  medicine.expiryDate, 
        batchNumber: medicine.batchNumber
      })

      if(!updatedMedicine){
        return res.status(500).json({ msg: `Update failed for the medicine ${medicine.medicine_name}`})
      }
       
      const cacheKey= `addMed-${medicine_id}`
      await client.set(cacheKey, updatedMedicine,'EX', 3600)

      console.log(`Data updated for the medicine ${medicine.medicine_name}`)
      res.status(200).json({msg: "Data updated for the medicine.", updatedMedicine: updatedMedicine})

      const allMedicines= await Medicines.findAll();
      const cacheKey01= `updated-med`
      await client.set(cacheKey01, allMedicines,'EX', 3600)

  }catch(err){
      console.log(err)
      return res.status(500).json({msg : "Internal Server Error"})
  }
}


exports.handleDeleteMedicine= async(req, res)=>{
  try{
      const { medicine_id }= req.body;
      const cacheKey= `addMed-${medicine_id}`
      
      const medicine = await Medicines.findByPk(medicine_id);
      if (!medicine) {
        return res.status(404).json({ message: 'Medicine not found' });
      }
      await medicine.destroy();
      await client.del(cacheKey);
      console.log("Medicine Delete Successfully from redis and from database.")
      return res.status(200).json({ message: 'Medicine deleted successfully' });
  }catch(err){
      console.log(err)
      return res.status(500).json({msg : "Internal Server Error"})
  }
}