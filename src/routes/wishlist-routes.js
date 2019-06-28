const express = require('express')
const WishList = require('../models/wishlist')
const routes = express.Router()
const auth = require('../middlewares/auth')

// create wish route // 

routes.post('/wishlist' , auth , async (req , res) => {

    try {
        const wish = new WishList({
            ...req.body,
            wishedBy : req.profile._id
        })  

        await wish.save()

        res.status(201).send(wish)
    } 
    
    catch (e){
        res.status(400).send(e)
    }

})

routes.get('/wishlist/:id' , auth , async (req , res) => {
   const _id = req.params.id
   
   try {
       const wish = await WishList.findOne({
           _id,
           wishedBy : req.profile._id
       })

       if(!wish){
           res.status(404).send("No wish list found")
       }

       await wish.populate('wishedBy').execPopulate()

       res.send(wish)
   }
   catch(e){
      res.status(500).send(e)
   }


})

routes.get('/wishlist/' , auth , async (req , res) => {
    try {
        // const wishList = await WishList.find({
        //     wishedBy : req.profile._id
        // })

        // const wishList = await req.profile.populate('wishList').execPopulate()

        const { status , limit , skip , sortAt , order } = req.query
 
       const match = {}

       // this is because query string value is string 
       // and in database we stored status as boolean
   
       if(status){
            match.status = (status) === 'true'
        }

        const sort = {}

        if(sortAt){
             sort[sortAt] = (order === 'desc') ? -1 : 1
        }

        const wishList = await req.profile.populate({
            path: 'wishList',
            match,
            options : {
                limit : parseInt(limit),
                skip : parseInt(skip),
                sort
            }
        }).execPopulate()



        if(!wishList){
            res.status(404).send('no wish list found')
        }

        res.send(wishList)

    }
    
    catch(e){
        res.status(500).send(e)
    }
})


routes.delete('/wishlist/:id' , auth , async (req , res) => {
    try{
      const wish = await WishList.findOneAndDelete({
          _id : req.params._id,
          wishedBy : req.profile._id
      })
      
      if(!wish){
         res.status(404).send()
      }

      res.send(wish)

    }
    
    catch(e){
         res.status(500).send()
    }
})

routes.patch('/wishlist/:id' , auth , async (req , res) => {
    const modifiedWish = req.body
    const fieldsToUpdate = Object.keys(modifiedWish)
    const fieldsInModel = ['wish' , 'status']
    const isUpdateAllowed = fieldsToUpdate.every((filed) => fieldsInModel.includes(filed))

    if(!isUpdateAllowed){
       return res.status(400).send({error : 'Invalid fields'})  
    }

    try {
        const wish = await WishList.findOne({
            _id : req.params.id,
            wishedBy : req.profile._id
        })

        if(!wish){ return res.status(404).send() }
        Object.assign(wish , modifiedWish)

        await wish.save()
        res.send(wish)

    }
    catch(e){
        res.status(400).send(e)
    }
})

module.exports = routes