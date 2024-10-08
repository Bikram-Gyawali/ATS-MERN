const { json } = require('express');
const express = require('express');
const app = express();
const Cloudinary = require('cloudinary');
const cloud = require("../../Config/Cloudnary.js");

const OrganizationModal = require('../../Models/Organization_Model.js');
const userModel = require('../../Models/User_Model.js');
const { findOneAndUpdate } = require('../../Models/Organization_Model.js');
const generateGeoHash = require('../../utils/geoHashAlgorithm.js');

const ProfileRouter = async (req, res, next) => {
    //    --> ORGANIZATION DEATILS EXTRACTION
    console.log("reqbody",req.headers.userID)
    const org_name = req.body.detailed_data.name;
    const phone = req.body.detailed_data.phone;
    const latitude = req.body.detailed_data.latitude;
    const longitude = req.body.detailed_data.longitude;
    const website_link = req.body.detailed_data.website_link;
    const logo = req.body.logo;
    const departments = req.body.detailed_data.departments;
    const address = req.body.detailed_data.address;
    const city = req.body.detailed_data.city;
    const country = req.body.detailed_data.country;
    const region = req.body.detailed_data.region;
    const fb_link = req.body.detailed_data.fb_link;
    const insta_link = req.body.detailed_data.insta_link;
    const yt_link = req.body.detailed_data.yt_link;
    const linkedIn_link = req.body.detailed_data.linkedin_link;

    // // --> EXTRACTING TEAM DATA
    try {
    const locationHash = await generateGeoHash(parseFloat(latitude), parseFloat(longitude));
    const { name, email, role } = req.body.team_details;
    const data = [{ name, email, role }];
    console.log(departments);
    var departments2 = [departments]
    departments2 = departments2[0] ? departments2[0].list : []

    // // -> to get the image url path    
    // console.log(req.file.path)

    // // -> Storing selected image to cloud
    console.log("req.file",req.files[0].path)
    const img = await Cloudinary.v2.uploader.upload(req.files[0].path);
    const img_url = img.secure_url;

    // -> so 1st check is there is valid reg user which is trying to setup org account
    const checkUser = await userModel.findById(req.headers.userID)
    console.log("checkuser",checkUser)

    if (checkUser.org_registered == false) {

        const org = await new OrganizationModal({
            "username": checkUser.username,
            "password": "Hamza123",
            "organization_name": org_name,
            "phoneNo": phone,
            "website": website_link,
            "logo": img_url,
            "departments": departments2,

            "office_address": address,
            "office_city": city,
            "office_country": country,
            "fb_url": fb_link,
            "linkedIn_url": linkedIn_link,
            "insta_url": insta_link,
            "yt_url": insta_link,
            "team_members": data,
            "latitude": latitude,
            "longitude": longitude,
            "locationHash": locationHash
        })


        await org.save()
        // findOneAndUpdate

        try {

            //Now 1st i have to get the acutall id value from _id with this code

            var user_id = org._id;
            user_id = user_id.toString();
            const profile = await userModel.findOneAndUpdate(
                { _id: req.headers.userID }, // replace with the organization ID
                { $set: { org_registered: true, org_id: user_id } }, // use $set operator to update the field
                { new: true }, // return the updated document
            );
            await org.save()
            await profile.save();


            return res.status(200).json({ message: "user saved" });

        } catch (error) {
            // console.log(error)
            return res.status(500).json(error)
        }


    }
    //1st Make Sure Is Organization is already registered or not
    else if (checkUser.org_registered == true) {
        // console.log('2nd time hai');
        // console.log('already organizaion is REGISTERED  :-> STATUS  = ' + checkUser.org_registered);
        return res.status(400).json({ message: "Already Organization Setup Or Fill Employee All Details" })
    }


    return res.status(404).json({ message: "Invalid username" })
} catch (error) {
    console.log(error)
    return res.status(500).json(error)
}
}



module.exports = ProfileRouter;