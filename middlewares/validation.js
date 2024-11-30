const validator= require('validator')
const xss= require('xss')

exports.validateAndSanitizeInput= async (req, res, next)=>{
  try{
    const { name, address, latitude, longitude } = req.body
    const errors = [];

      if (!name || !validator.isLength(name, { min: 1 })) {
        errors.push('Name is required.')
      }else{
        req.body.name = xss(name.trim())
        if (!validator.isAlphanumeric(req.body.name, 'en-US', { ignore: ' ' })) {
          errors.push('Name contains invalid characters.');
        }
      }

      if (!address || !validator.isLength(address, { min: 1 })) {
        errors.push('Address is required.')
      }else{
        req.body.address = xss(address.trim())
      }

      if ( !latitude || !validator.isFloat(latitude.toString(), { min: -90, max: 90 }) ) {
        errors.push('Latitude must be a valid float.')
      }else{
        req.body.latitude = xss(latitude.toString())
      }

      if ( !longitude || !validator.isFloat(longitude.toString(), { min: -180, max: 180 }) ) {
        errors.push('Longitude must be a valid float.')
      }else{
        req.body.longitude = xss(longitude.toString())
      }

      const sqlInjectionPattern = /('|"|;|--|\b(OR|AND)\b)/i
      if ( sqlInjectionPattern.test(name) || sqlInjectionPattern.test(address) ||  sqlInjectionPattern.test(latitude) || sqlInjectionPattern.test(longitude) ) {
         errors.push('Input contains potentially malicious SQL content.');
      }

      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      next();
  }catch(err){
       console.log("Error in Input Validation API: ", err)
       return res.status(500).json({ msg: "Internal Server Error"})
  }
}


exports.validateLatitudeAndLongitude= async( req, res, next)=>{
  try{
      const { latitude, longitude } = req.query
      const errors = [];

      if ( !latitude || !validator.isFloat(latitude.toString(), { min: -90, max: 90 }) ) {
        errors.push('Latitude must be a valid float.')
      }else{
        req.query.latitude = xss(latitude.toString())
      }

      if ( !longitude || !validator.isFloat(longitude.toString(), { min: -180, max: 180 }) ) {
        errors.push('Longitude must be a valid float.')
      }else{
        req.query.longitude = xss(longitude.toString())
      }

      const sqlInjectionPattern = /('|"|;|--|\b(OR|AND)\b)/i
      if ( sqlInjectionPattern.test(latitude) || sqlInjectionPattern.test(longitude) ) {
         errors.push('Input contains potentially malicious SQL content.');
      }

      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }
      
      next();
  }catch(err){
    console.log("Error in Input Validation API: ", err)
    return res.status(500).json({ msg: "Internal Server Error"})
  }
}


