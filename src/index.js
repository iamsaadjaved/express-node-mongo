require("./db/mongoose");

const express = require("express");
const app = express();
const profileRoutes = require('./routes/profile-routes')
const wishListRoutes = require('./routes/wishlist-routes')


// app.use((req , res , next) => {
//     res.status(503).send("site is currently down. check back soon ")
// })


app.use(express.json());

app.use(profileRoutes)
app.use(wishListRoutes)



const port = process.env.PORT 

app.listen(port, () => console.log("server is up and runnig on port " + port));
