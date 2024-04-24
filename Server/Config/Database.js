const mongoose = require("mongoose")
const connection = async () => {
    try {
        await mongoose.connect(process.env.MONGOURL);
    }
    catch (e) {
        console.log("DB Error: " + e);
    }
}

module.exports = connection;