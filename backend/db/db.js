import mongoose from "mongoose";
import dotenv from "dotenv"


dotenv.config();
//database connection
function connect(){
    mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log("Connected to database")
    })
    .catch(err =>{
        console.log(err);
    });
}


export default connect;