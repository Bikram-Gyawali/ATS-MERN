const Job = require("../../Models/JobModel");


const UpdateJobStatus = async (req, res) => {
    const { id, job_status } = req.body;
    if (!id) {
        return res.status(440).json({ message: "on id found" });
    }

    const query = { _id: id };
    const update = { $set: { job_status: job_status === "Active" ? "Closed" : "Active" } };
    const options = { new: true };

    const jobs = await Job.findOneAndUpdate(query, update, options);

    return res.status(200).json({ jobs });
}


module.exports = UpdateJobStatus;