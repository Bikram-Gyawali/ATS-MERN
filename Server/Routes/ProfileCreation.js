// -> IMPORTS
const ProfileRouter = require('../Controllers/Setup Profile/Profile_Setup');
const multer = require('multer')
// -> INITIALIZATIONS
const express = require('express');
const AuthMiddleware = require('../Middleware/AuthMiddleware');
const VerifyToken = require('../Middleware/VerifyToken');
const ProfileSetup = express.Router();

//* ** MULTER CONFIGURATION  ** */

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// *******************************************************************


// -> MAIN CODE

//1st Time Profile Setup Route
ProfileSetup.post("/setup", AuthMiddleware, upload.any(['logo',"logo_url"]),  ProfileRouter);

ProfileSetup.post("/", (req, res) => {
    res.send("welcome")
})
// -> EXPORT
module.exports = ProfileSetup;
