const mongoose = require('mongoose');
require('dotenv').config();

const mongo_uri = process.env.MONGODB_URI;
const connectDB = async () => {
    try {
        const connect = await mongoose.connect(mongo_uri, {
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        })
        console.log(`DB connected: ${connect.connection.host}`.yellow.bold)
    }
    catch (err) {
        console.log(`Error: ${err.message}`.red.bold);
    }
}

module.exports = connectDB;




