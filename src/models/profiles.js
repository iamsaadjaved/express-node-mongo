const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken')
const WishList = require('./wishlist')


const profileSchema = new mongoose.Schema({
  name: {
    type: String
  },

  age: {
    type: Number,
    min:0,
    validate(value) {
      if (value <= 18) {
        throw new Error("Age must be 18");
      }
    }
  },

  graduate: {
    type: Boolean,
    default: false
  },

  email: {
    type: String,
    unique : true ,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Excepted correct email");
      }
    }
  },

  password: {
    type: String,
    required: true,
    minLenght: 6,
    trim: true,
    validate(value) {
      if (value.toLowerCase().includes("password")) {
        throw Error("password cannot contain password");
      }
    }
  },
  
  tokens : [{
    token: {
      type : String , 
      required : true
    }
  }],

  avatar : {
      type : Buffer
  }


} , { toObject : {virtuals : true}, timestamps: true });



profileSchema.virtual('wishList' , {
  ref: 'WishList',
  localField : '_id',
  foreignField : 'wishedBy'
  
  
})


profileSchema.pre('save' , async function(next) {
  const profile = this;

  // console.log(profile.password, "pre password");

  if(profile.isModified('password')){
    
    profile.password = await bcrypt.hash(profile.password, 8)
   
  }


  // console.log(profile.password, "hashed password")

  next();

});


profileSchema.pre('remove' , async function(next) {
  const profile = this;

  await WishList.deleteMany({
    wishedBy : profile._id
  })

  next();

});

profileSchema.statics.findByCredentials = async (email , password) => {
  const profile = await Profiles.findOne({email})

  if(!profile){
    throw new Error("unable to login")
  }

  const isMatch = await bcrypt.compare(password , profile.password )
  
  if(!isMatch){
    throw new Error("unable to login")
  }

  return profile

}

profileSchema.methods.generateAuthToken = async function (){

  const profile = this

  const token = jwt.sign({ _id: profile._id.toString() } , process.env.JWT_SECRET )

  profile.tokens = profile.tokens.concat({token})

  await profile.save()

  return token


}

profileSchema.methods.toJSON =  function() {
  const profile = this 
  const publicProfileData = profile.toObject()

  delete publicProfileData.password
  delete publicProfileData.tokens
  delete publicProfileData.avatar

  console.log(publicProfileData)

  return publicProfileData

}

// profileSchema.statics.toJSON =  function(records) {
//   const profiles = records
  
//   const publicProfileFields = profiles.map((p) => {

//     const obj = p.toObject()

//     delete obj.password
//     delete obj.tokens
//     return obj

//   })
 
//   // return publicProfileFields


// }






const Profiles = mongoose.model("Profiles", profileSchema  );


module.exports = Profiles;
