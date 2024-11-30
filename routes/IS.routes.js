const express= require('express')
const router= express.Router();
const  { validateAndSanitizeInput, validateLatitudeAndLongitude}= require('../middlewares/validation.js')
const { handlePostSchoolData, handleGetSchoolDistance}= require('../controllers/internship.js')


router.get("/listSchools", validateLatitudeAndLongitude, handleGetSchoolDistance )

router.post("/addSchool", validateAndSanitizeInput, handlePostSchoolData)




module.exports= router
