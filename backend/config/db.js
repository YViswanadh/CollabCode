const mongoose = require('mongoose');

const connectDBOptions = {

}

const connectDB = async() => {
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI, connectDBOptions);
        console.log(`MongoDB Connected: ${conn.connection.host} on database ${conn.connection.name}`);
    }catch(error){
        console.error(`MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
}

mongoose.connection.on('connected', ()=>{
    console.log('mongoose connected to DB');
})

mongoose.connection.on('error', (error)=>{
    console.log(`Mongoose connection error : ${error}`);
})

mongoose.connection.on('disconnected', ()=>{
    console.log(`Mongoose disconnected from DB`);
})

process.on('SIGINT', async() => {
    await mongoose.connection.close();;
    console.log('Mongoose connection due to app termination: (SIGINT)');
    process.exit(0);
})

module.exports = connectDB