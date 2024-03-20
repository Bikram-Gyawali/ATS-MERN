const Job = require("../../Models/JobModel");
const Candidates = require("../../Models/Candidate");
const natural = require("natural");
const axios = require("axios"); // For making HTTP requests
const { parse } = require("node-html-parser"); // For parsing HTML
const pdf = require("pdf-parse"); // For parsing PDF files

const getAIFilteredCandidates = async (req, res, next) => {
  try {
    const jobId = req.params.jobId;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(400).json({ error: "Job not found" });
    }
    console.log("job id", jobId);
    const appliedCandidates = await Candidates.find({ jobID: jobId }).lean();

    const jobDescription = job.job_description;
    console.log("applied candidates", appliedCandidates, "job description", jobDescription);
    // Preprocess job description
    const tokenizedJobDescription = new natural
      .WordTokenizer()
      .tokenize(jobDescription.toLowerCase());
    console.log("tokenizedJobDescription", tokenizedJobDescription);
    // Fetch and process resumes
    const processedCandidates = await Promise.all(
      appliedCandidates.map(async (candidate) => {
        try {
          const response = await axios.get(candidate.ResumeURL, { responseType: "arraybuffer" });
          const pdfBuffer = response.data;
          console.log("pdfBuffer", pdfBuffer);
          const pdfText = await pdf(pdfBuffer);

          const tokenizedResume = new natural
            .WordTokenizer()
            .tokenize(pdfText.text.toLowerCase());
          console.log("tokenizedResume", tokenizedResume);
          // Compute TF-IDF for resume
          const tfidf = new natural.TfIdf();
          tfidf.addDocument(tokenizedResume);

          // Calculate cosine similarity
          let dotProduct = 0;
          let jobMagnitude = 0;
          let resumeMagnitude = 0;

          tokenizedJobDescription.forEach((term) => {
            const jobTFIDFValue = tfidf.tfidf(term, 0); // 0 represents the index of the job description
            dotProduct += tfidf.tfidf(term) * jobTFIDFValue;
            jobMagnitude += Math.pow(jobTFIDFValue, 2);
            resumeMagnitude += Math.pow(tfidf.tfidf(term), 2);
          });

          const cosineSimilarity =
            dotProduct / (Math.sqrt(jobMagnitude) * Math.sqrt(resumeMagnitude));

          return {
            candidate,
            similarity: cosineSimilarity,
          };
        } catch (error) {
          console.error(
            `Error processing candidate ${candidate._id}: ${error.message}`
          );
          return null; // Handle error gracefully
        }
      })
    );

    console.log("processedCandidates", processedCandidates);

    // Filter out any candidates where an error occurred during processing
    const filteredCandidates = processedCandidates.filter(
      (candidate) => candidate !== null
    );

    console.log("filteredCandidates", filteredCandidates);
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
