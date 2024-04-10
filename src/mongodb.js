// const mongoose = require("mongoose")

// mongoose.connect("mongodb://localhost:27017/frontend",{
    
// }).then(()=>{
//     console.log("connection successful")
// }).catch((e)=>{
//     console.log("No Connection");
// })

// const LogInSchema = new mongoose.Schema({
//    id:{
//     type:Number,
//     required:true
//    },
//    name:{
//     type:String,
//     required:true
//    },
//    image:{
//     type:String,
//     required:true
//    },
//    category:{
//     type:String,
//     required:true
//    },
//    new_price:{
//     type:Number,
//     required:true
//    },
//    old_price:{
//     type:Number,
//     required:true
//    },
//    date:{
//     type:Date,
//     default:Date.now,
//    },
//    available:{
//     type:Boolean,
//     default:true
//    }

// })

 

// const Collection = new mongoose.model("product",LogInSchema)
// module.exports = Collection;