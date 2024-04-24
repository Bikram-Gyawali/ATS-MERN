const Job = require("../../Models/JobModel");
const OrganizationModal = require("../../Models/Organization_Model");
const generateGeoHash = require("../../utils/geoHashAlgorithm");

// Example usage:
const latitude = 37.7749; // Replace with the actual latitude
const longitude = -122.4194; // Replace with the actual longitude
const precision = 8; // Adjust the precision as needed

const GetAllPostedJob = async (req, res, next) => {
  // get user latitude and longitude
  const { latitude, longitude } = req.query;

  console.log("user data", latitude, longitude);
  // based upon the user longitude and latitude i have to find the nearest organization and also list other jobs available of other organization near to the user latitude and longitude
  const { latitude: orgLatitude, longitude: orgLongitude } =
    await OrganizationModal.find().lean();

  const fetchAllPostedJobs = await Job.find();

  if (fetchAllPostedJobs) {
    return res.status(200).json({ fetchAllPostedJobs });
  } else {
    return res.status(400).json({ message: "No job found" });
  }
};

const GetAllPostedJobs = async (req, res, next) => {
  // get user latitude and longitude
  const { latitude, longitude } = req.query;

  console.log("user data", latitude, longitude);
  console.log(latitude, longitude);

  if (latitude === "undefined" && longitude === "undefined") {
    const fetchAllPostedJobs = await Job.find({ job_status: "Active" }).lean();
    return res.status(200).json({ fetchAllPostedJobs });
  }

  // Convert user coordinates to GeoHash
  const userGeoHash = generateGeoHash(
    parseFloat(latitude),
    parseFloat(longitude)
  );

  const allOrganizations = await OrganizationModal.find().lean();

  // Sort jobs based on their GeoHash proximity to the user
  allOrganizations.sort((jobA, jobB) => {
    const distanceA = geoHashDistance(userGeoHash, jobA.locationHash);
    const distanceB = geoHashDistance(userGeoHash, jobB.locationHash);

    return distanceA - distanceB;
  });

  if (allOrganizations.length > 0) {
    try {
      let fetchAllPostedJobs = await Promise.all(
        allOrganizations.map(async (org) => {
          const job = await Job.find({ org_id: org._id, job_status: "Active" })
            .lean()
            .exec();
          return job;
        })
      );
      // Flatten the array of arrays to a single array
      fetchAllPostedJobs = fetchAllPostedJobs.flat();
      return res.status(200).json({ fetchAllPostedJobs, allOrganizations });
    } catch (error) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    return res.status(400).json({ message: "No jobs found" });
  }
};

// Function to calculate distance between two GeoHash strings
function geoHashDistance(geoHash1, geoHash2) {
  if (geoHash1.length !== geoHash2.length) {
    throw new Error("GeoHash strings must have the same precision");
  }

  let distance = 0;

  for (let i = 0; i < geoHash1.length; i++) {
    if (geoHash1.charAt(i) !== geoHash2.charAt(i)) {
      break;
    }

    // Each character in the GeoHash represents a different level of precision
    // We add 1 for each different character to the distance
    distance++;
  }

  return distance;
}

module.exports = GetAllPostedJobs;
