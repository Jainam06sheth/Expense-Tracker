import mongoose from 'mongoose';

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URL);        
        console.log("database is connected");
    }
    catch(error){
        console.log("dataase is not connect");
        process.exit(1);
    }
}

export default connectDB;