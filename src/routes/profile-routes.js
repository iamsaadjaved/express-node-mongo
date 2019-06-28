const express = require("express");
const Profiles = require("../models/profiles");
const routes = express.Router()
const auth = require('../middlewares/auth')
const multer = require('multer')
const sharp = require('sharp')
const {sendGoodByeEmail , sendWelcomeEmail} = require('../Emails/profile-emails')


// delete Image from database // 

routes.delete('/profiles/myavatar' , auth , async (req , res) => {
  req.profile.avatar = undefined
  await req.profile.save()
  res.send()
})



// upload image into database //

const uploadImage = multer({
  limits: {
      fileSize : 1000000 // for not over 1 mb
  },
  fileFilter (req , file , cb){
      if(!file.originalname.match(/\.(jpg|jpeg|png)$/) ){
         return cb(new Error('please upload a jpg file'))
      }

     cb(undefined , true) // true is for carry on with file upload and false is for cancel file 
  }
})
 
// upload profile image //

routes.post('/profiles/uploadFile' , auth , uploadImage.single('avatar') , async (req , res) => {
    // req.profile.avatar = req.file.buffer
    // await req.profile.save()
    
    const buffer = await sharp(req.file.buffer).resize({ width: 200 , height : 200 }).jpeg().toBuffer()
    req.profile.avatar = buffer

    await req.profile.save()
    
    
    
    res.send()
} , (error , req , res , next) => {
  res.status(400).send({error : error.message})
})

// get my profile avatar // 

routes.get('/profiles/myprofile/avatar' , auth , async (req , res) => {
  try {
    const profile = req.profile

    if(!profile.avatar){
       throw new Error()
    }

    res.set('Content-Type' , 'image/jpeg')
    res.send(profile.avatar)
  }catch(e){
     res.status(404).send()
  }
})




// create user with post method //

routes.post("/profiles", async (req, res ) => {
    try {
      
      const profile = await Profiles(req.body).save()
     const token = await profile.generateAuthToken()
     sendWelcomeEmail(profile.name , profile.email)

      

      console.log(req.body)
      // await profile.save()
      
      console.log(profile)
      res.send({profile , token});

    } catch (e) {
      res.status(400).send(e);
      // console.log(e)
    }
  });
  
  // Get All user //
  
  routes.get("/profiles", async (req, res) => {
    try {
      const profiles = await Profiles.find({});
  
      if (!profiles) {
        res.status(404);
      }

      // const publicDataProfiles = Profiles.sendPublicDataOnly(profiles)
  
      res.send(profiles);

    } catch (e) {
      res.status(500).send(e);
    }
  });
  
  // find record by user ID //
  
  routes.get("/profiles/myprofile", auth , async (req, res) => {
    // const id = req.params.id;
  
    try {

      // const profile = await Profiles.findById(id);
    
      
      const profile = req.profile

      await profile.populate('wishList').execPopulate()


      // if (profile._id.toString() !== id) {
      //   res.status(404).send();
      // }
  
      res.send(profile);
    } catch (e) {
      res.status(500);
    }
  });

  
  // Patch : For updating user data in database //
  
  routes.patch("/profiles/myprofile", auth ,async (req, res) => {
    const changedProfile = req.body
    const fieldsToUpdate = Object.keys(changedProfile)  ;
    const fieldsInModel = ["name", "age", "graduate", "email" , "password"];
    const isUpdateAllowed = fieldsToUpdate.every(filed => fieldsInModel.includes(filed));
  
    if (!isUpdateAllowed) {
      return res.status(400).send({ error: "invalid fields" });
    }
  
    try {
      // const profile = await Profiles.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      // const profile = await Profiles.findById(req.params.id)

      const profile = req.profile

      // this is removed as if the user authenticated
      // that means its exist , so no need to check
      
      // if (!profile) {
      //   return res.status(404).send();
      // }

      Object.assign(profile , changedProfile)

      await profile.save()
  
      res.send(profile);
    } 
    
    catch (e) {
      res.status(400).send(e);
    }
  });
  
  // Delete method for delete profile //
  
  routes.delete("/profiles/myprofile", auth , async (req, res) => {
    try {
    
      // const profile = await Profiles.findByIdAndDelete(req.params.id);
      // if (!profile) {
      //   res.status(404);
      // }

    //  await req.profile.populate('wishList').execPopulate() 

     await req.profile.remove()
     sendGoodByeEmail(req.profile.name , req.profile.email )

      res.send(req.profile);
    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
  });

 routes.post('/profiles/login' , async (req , res) => {
   try {
     const profile = await Profiles.findByCredentials(req.body.email , req.body.password)

     const token = await profile.generateAuthToken()

    //  const publicData = profile.sendPublicDataOnly()
     
     res.send({profile , token})

   }catch (e){
       res.status(400).send()
   }
 })

// logout route //


 routes.post('/profiles/logout' , auth , async (req , res) => {

   try {
    
    const { profile , token } = req

    profile.tokens = profile.tokens.filter((t ) => t.token !== token )
    await profile.save()
    res.send()

   }catch (e){
      res.status(400).send()
   } 

 })
   

  module.exports = routes
  
  