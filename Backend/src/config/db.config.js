import mongoose from 'mongoose';

const connectDB = async ()=>{
    try{
        await mongoose.connect(process.env.MONGO_DB_URL);
        console.log("database is connected");
    }catch(error){
        console.log("database connection error");
        process.exit(1);
    }
}

export default connectDB;