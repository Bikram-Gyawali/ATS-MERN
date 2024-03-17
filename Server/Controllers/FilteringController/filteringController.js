const Job = require("../../Models/JobModel");
const Candidates = require("../../Models/Candidate");

const getAIFilteredCandidates = async (req, res, next) => {
  try {
    const jobId = req.body.jobId;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(400).json({ error: "Job not found" });
    }

    const appliedCandidates = await Candidates.find({ jobId: jobId }).lean();

    const jobDescription = job.job_description;
    const resumeURL = appliedCandidates.map((candidate) => {
      return candidate.ResumeURL;
    });

    // implement cosine similarity or ifdif alogorithm for filtering out the candidates based on their resumes comparing with job description need to implement it with packages

    const filteredCandidates = appliedCandidates.filter((candidate) => {
      const candidateResume = candidate.ResumeURL;
      return resumeURL.includes(candidateResume);
    });

    return res.status(200).json({
      appliedCandidates: filteredCandidates,
    })
  } catch (error) {
    next(error);
  }
};

module.exports = getAIFilteredCandidates;
