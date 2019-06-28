const mongoose = require('mongoose')

const wishListSchema = new mongoose.Schema({
    wish: {
        type : String,
        required : true
    },

    wishedBy : {
        type : mongoose.Schema.Types.ObjectId,
        required: true,
        ref : 'Profiles'
    },

    status : {
        type : Boolean,
        default : false
    }
} , {
    timestamps : true
})

const WishList = mongoose.model('WishList' , wishListSchema)

module.exports = WishList