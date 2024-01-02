const express = require("express");
const Job = require("../../Models/JobModel");
const OrganizationModal = require("../../Models/Organization_Model");

const app = express();

const GetAllPostedJobs = async (req, res, next) => {
  // get user latitude and longitude
  const { latitude, longitude } = req.query;

  console.log("user data", latitude, longitude);
  // based upon the user longitude and latitude i have to find the nearest organization and also list other jobs available of other organization near to the user latitude and longitude
  const getOrginization = await OrganizationModal.find();

  const fetchAllPostedJobs = await Job.find();

  if (fetchAllPostedJobs) {
    return res.status(200).json({ fetchAllPostedJobs });
  } else {
    return res.status(400).json({ message: "No job found" });
  }
};

module.exports = GetAllPostedJobs;
``