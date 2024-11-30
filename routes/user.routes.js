const express= require('express')
const router= express.Router()
const UserController= require("../controllers/user.js")
const MedicineController= require("../controllers/medicine.js")
const Middleware= require('../middlewares/authenticationJwt.js')


router.post("/email-signup", UserController.emailAuthentication)

router.post("/otp", UserController.handlePostOTP )

router.post("/login", UserController.handlePostUserLogin )

router.post("/email-passwordchange", UserController.handlePostEmailForOtp)

router.post("/forget-password", UserController.handlePostForgetPassword)



router.post("/update-userdata", Middleware.handleJwtAuthentication, UserController.handlePostUpdateUserData)

router.post("/logout", Middleware.handleJwtAuthentication, UserController.handleGetLogout )

router.post("/add-medicine", Middleware.handleJwtAuthentication, MedicineController.handlePostAddMedicines)

router.post("/update-medicine-data", Middleware.handleJwtAuthentication, MedicineController.handlePostUpdateMedicineData)

router.post("/delete-medicine", Middleware.handleJwtAuthentication, MedicineController.handleDeleteMedicine)

router.get("/get-all-medicine", Middleware.handleJwtAuthentication, MedicineController.handleGetAllMedicine)


module.exports= router