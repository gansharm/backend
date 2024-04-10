const port = 4000;
const express = require("express")
const app = express()
const mongoose = require('mongoose')
const jwt = require("jsonwebtoken")
const multer = require("multer")
const path = require("path")
const cors = require("cors");
const { error } = require("console");
 
app.use(express.json())
app.use(cors());

mongoose.connect("mongodb://localhost:27017/frontend",{
    
}).then(()=>{
    console.log("connection successful")
}).catch((e)=>{
    console.log("No Connection");
})
 
const Collection = new mongoose.model('products',{
   id:{
    type:Number,
    required:true
   },
   name:{
    type:String,
    required:true
   },
   image:{
    type:String,
    required:true
   },
   category:{
    type:String,
    required:true
   },
   new_price:{
    type:Number,
    required:true
   },
   old_price:{
    type:Number,
    required:true
   },
   date:{
    type:Date,
    default:Date.now,
   },
   available:{
    type:Boolean,
    default:true
   }

})


app.get("/",(req,res)=>{
    res.send("Express App is Running")
})
const storage = multer.diskStorage({
   destination:'./upload/images',
   filename:(req,file,cb)=>{
      return cb(null,`${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
   }
})
const upload = multer({storage:storage})
app.use("/images",express.static('upload/images'))
app.post('/upload',upload.single('product'),(req,res)=>{
   res.json({
      success:1,
      image_url:`http://localhost:${port}/images/${req.file.filename}`
   })
})
app.post("/addproduct",async (req,res)=>{
   let products = await Collection.find({})
   let id;
   if(products.length>0){
      let last_product_array = products.slice(-1);
      let last_product = last_product_array[0];
      id = last_product.id+1;
   }else{
      id=1;
   }
   const product = new Collection({
      id:id,
      name:req.body.name,
      image:req.body.image,
      category:req.body.category,
      new_price:req.body.new_price,
      old_price:req.body.old_price
   })
   console.log(product);
   await product.save();
   console.log("Saved");
   res.json({
      success:true,
      name:req.body.name
   })
})

//Creating API for deleting Products
app.post('/removeproduct', async(req,res)=>{
   await Collection.findOneAndDelete({id:req.body.id});
   console.log("Removed")
   res.json({
      success:true,
      name:req.body.name
   })
})

app.get("/allproducts", async (req,res)=>{
   let products = await Collection.find({})
   console.log("All Products Fetched")
   res.send(products);
})


const Users =  mongoose.model('Users',{
    name:{
        type:String,
    },
    email:{
        type:String,
        unique:true,
    },
    password:{
        type:String,
    },
    cartData:{
        type:Object, 
    },
    date:{
        type:Date,
        default:Date.now,
    }
})


app.post("/signup",async (req,res)=>{
   let check = await Users.findOne({email:req.body.email});
   if(check){
      return res.status(400).json({success:false,errors:"existing user found with same email address"})
   }
   let cart = {};
   for(let i = 0; i < 300; i++){
      cart[i] = 0;
   }
   const user = new Users({
      name:req.body.username,
      email:req.body.email,
      password:req.body.password,
      cartData:cart,
   })

   await user.save();

   const data = {
      user:{
         id:user.id
      }
   }

   const token = jwt.sign(data,'secret_ecom');
   res.json({success:true,token})
})

app.post('/login', async (req,res)=>{
   let user = await Users.findOne({email:req.body.email});
   if(user)
   {
      const passCompare = req.body.password === user.password;
      if(passCompare)
      {
         const data = {
            user:{
               id:user.id
            }
         }
         const token = jwt.sign(data,'secret_ecom')
         res.json({success:true,token})
      }else
      {
         res.json({success:false,errors:"Wrong Password"});
      }
   }else
   {
      res.json({success:false,errors:"Wrong Email Id"})
   }
})

app.get('/newcollection',async (req,res)=>{
   let collections = await Collection.find({});
   let newcollection = collections.slice(1).slice(-8);
   console.log("NewCollection fetched");
   res.send(newcollection);
}) 

app.get('/popularinwomen', async(req,res)=>{
   let collections = await Collection.find({category:"women"});
   let popular_in_women = collections.slice(0,4);
   console.log("Popular in Women Fetched");
   res.send(popular_in_women);
})

//  Creating middlewear to fetch user
const fetchUser = async (req,res,next) =>{
   const token = req.header('auth-token');
   if(!token){
      res.status(401).send({errors:"Please authenticate using valid token"})
   }
   else{
      try{
         const data = jwt.verify(token,'secret_ecom')
         req.user = data.user;
         next(); 
      }catch(error){
         res.status(401).send({errors:'Please authenticate using the valid token'})
      }
   }
}

app.post('/addtocart',fetchUser,async (req,res)=>{
   console.log("Added",req.body.itemId);
   let userData = await Users.findOne({_id:req.user.id});
   userData.cartData[req.body.itemId] += 1;
   await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData});
   res.send("Added");
})

app.post('/removefromcart',fetchUser,async (req,res)=>{
   console.log("Removed",req.body.itemId);
   let userData = await Users.findOne({_id:req.user.id});
   if( userData.cartData[req.body.itemId]>0)
   userData.cartData[req.body.itemId] -= 1;
   await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData});
   res.send("Removed");
})

// creating endpoint to get cartdata
app.post('/getcart',fetchUser,async(req,res)=>{
   console.log("GetCart");
   let userData = await Users.findOne({_id:req.user.id});
   res.json(userData.cartData);
})

app.listen(port,()=>{
   //   if(!error){
   //      console.log(`server is running on ${port}`)
   //   }else{
   //      console.log("Error:"+error)
   //   }
   console.log("server is running on " + port)
})

