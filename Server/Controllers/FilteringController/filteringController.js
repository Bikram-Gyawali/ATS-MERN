const Job = require("../../Models/JobModel");
const Candidates = require("../../Models/Candidate");
const natural = require("natural");
const axios = require("axios");
const pdf = require("pdf-parse");
const htmlToText = require('html-to-text');

const getAIFilteredCandidates = async (req, res, next) => {
  try {
    const jobId = req.params.jobId;
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(400).json({ error: "Job not found" });
    }

    const appliedCandidates = await Candidates.find({ jobID: jobId }).lean();
    const jobDescription = htmlToText.htmlToText(job.job_description);

    // Preprocess job description
    const tokenizedJobDescription = new natural.WordTokenizer().tokenize(
      jobDescription.toLowerCase()
    );

    // Compute TF-IDF for job description
    const tfidfJobDescription = new natural.TfIdf();
    tfidfJobDescription.addDocument(tokenizedJobDescription.join(" "));

    // Fetch and process resumes
    const processedCandidates = await Promise.all(
      appliedCandidates.map(async (candidate) => {
        try {
          const response = await axios.get(candidate.profilePic, {
            responseType: "arraybuffer", // Ensure response is treated as binary data
          });
          const pdfData = Buffer.from(response.data);

          // Parse PDF data
          const pdfText = await pdf(pdfData);

          // Check if pdfText.text is defined
          if (!pdfText || !pdfText.text) {
            console.error(
              `Error parsing PDF for candidate ${candidate._id}: PDF text is undefined.`
            );
            return null; // Skip this candidate
          }

          const tokenizedResume = new natural.WordTokenizer().tokenize(
            pdfText.text.toLowerCase()
          );

          // Join tokens back into a single string
          const resumeText = tokenizedResume.join(" ");

          // Compute TF-IDF vector for resume
          const tfidfResume = new natural.TfIdf();
          tfidfResume.addDocument(resumeText.toString());

          const resumeVector = tfidfResume.tfidf(resumeText.toString());
            console.log("resume vector",resumeVector)
          // Compute TF-IDF vector for job description
          const jobDescriptionVector = tfidfJobDescription.tfidf(tokenizedJobDescription.join(" "));
            console.log("job description vector",jobDescriptionVector)
          // Calculate cosine similarity
          const similarity = natural.TfIdfVector.prototype.tfidf.cosine(resumeVector, jobDescriptionVector);

          return { ...candidate, similarity };
        } catch (error) {
          console.error(`Error processing candidate: ${error.message}`);
          return null; // Handle error gracefully
        }
      })
    );

    // Filter out any candidates where an error occurred during processing
    const filteredCandidates = processedCandidates.filter(
      (candidate) => candidate !== null
    );

    // Sort candidates based on similarity
    const sortedCandidates = filteredCandidates.sort(
      (a, b) => b.similarity - a.similarity
    );

    res.status(200).json(sortedCandidates);
  } catch (error) {
    next(error);
  }
};

module.exports = getAIFilteredCandidates;