const express = require("express");
const app = express();
const cloudinary_config = require("../../Config/Cloudnary.js");
const Cloudinary = require("cloudinary");
const Candidate = require("../../Models/Candidate.js");
const Job = require("../../Models/JobModel.js");

const ApplyForJob = async (req, res, next) => {
  try {
    const {
      dob,
      accadamicsSession,
      personalInfo,
      accadamics,
      profesional,
      contact,
      org_id,
      job_id,
    } = req.body;

    if (
      !dob ||
      !accadamicsSession ||
      !personalInfo ||
      !accadamics ||
      !profesional ||
      !contact ||
      !org_id ||
      !job_id
    ) {
      return res.status(206).json({ message: "Fill the form completely." });
    }

    const { day, month, year } = dob;
    const dateOfBirth = `${day}/${month}/${year}`;
    const { from, to } = accadamicsSession;
    const sessionDetails = `${from} - ${to}`;

    if (!req.files || req.files.length < 2) {
      return res
        .status(400)
        .json({ message: "Must attach your resume and profile picture." });
    }

    const [resumeUpload, imgUpload] = await Promise.all([
      Cloudinary.v2.uploader.upload(req.files[0].path, { folder: "Resume" }),
      Cloudinary.v2.uploader.upload(req.files[1].path, {
        folder: "ProfilePictures",
      }),
    ]);

    const resume_url = resumeUpload.url;
    const img_url = imgUpload.secure_url;

    const { firstName, lastName, gender, address, city, zipCode } =
      personalInfo;
    const { institute, level, majors } = accadamics;
    const { title, duration, companyName } = profesional;
    const { emailAddress, phoneNo, linkedinProfile, gitHubProfile } = contact;

    const ApplyingCandidate = new Candidate({
      firstName,
      lastName,
      dob: dateOfBirth,
      gender,
      address,
      city,
      zipCode,
      institute,
      level,
      majors,
      session: sessionDetails,
      title,
      duration,
      companyName,
      emailAddress,
      phoneNo,
      linkedinProfile,
      gitHubProfile,
      profilePic: img_url,
      ResumeURL: resume_url,
      jobID: job_id,
      orgID: org_id,
    });

    const findJob = await Job.findById(job_id);

    if (findJob) {
      findJob.applicants_no += 1;
      findJob.report_status.applied += 1;

      if (level == "B.S") {
        findJob.report_educational_level.push("BS");
      } else if (level == "M.S") {
        findJob.report_educational_level.push("MS");
      } else {
        findJob.report_educational_level.push("Ph.D");
      }

      findJob.report_city.push(city);
      findJob.report_university.push(institute[0]);

      if (gender == "Male") {
        findJob.report_male_vs_female.male += 1;
      } else if (gender == "Female") {
        findJob.report_male_vs_female.female += 1;
      }
    }

    await Promise.all([ApplyingCandidate.save(), findJob.save()]);
    return res.status(200).json({ message: "Application Submitted!" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "An error occurred while processing the request." });
  }
};

module.exports = ApplyForJob;
