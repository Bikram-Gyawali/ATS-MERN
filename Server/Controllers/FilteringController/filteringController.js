const Job = require("../../Models/JobModel");
const Candidates = require("../../Models/Candidate");
const natural = require("natural");
const axios = require("axios"); // For making HTTP requests
const { parse } = require("node-html-parser"); // For parsing HTML

const getAIFilteredCandidates = async (req, res, next) => {
  try {
    const jobId = req.body.jobId;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(400).json({ error: "Job not found" });
    }

    const appliedCandidates = await Candidates.find({ jobId: jobId }).lean();

    const jobDescription = job.job_description;

    // Preprocess job description
    const tokenizedJobDescription = natural
      .WordTokenizer()
      .tokenize(jobDescription.toLowerCase());

    // Fetch and process resumes
    const processedCandidates = await Promise.all(
      appliedCandidates.map(async (candidate) => {
        try {
          const response = await axios.get(candidate.ResumeURL);
          const html = response.data;
          const parsedHTML = parse(html);
          const resumeText = parsedHTML.text; // Extract text from HTML (modify this depending on the actual format of the resume)
          const tokenizedResume = natural
            .WordTokenizer()
            .tokenize(resumeText.toLowerCase());

          // Compute TF-IDF for resume
          const tfidf = new natural.TfIdf();
          tfidf.addDocument(tokenizedResume);

          // Calculate cosine similarity
          let dotProduct = 0;
          let jobMagnitude = 0;
          let resumeMagnitude = 0;

          Object.entries(tokenizedJobDescription).forEach(([term]) => {
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

    // Filter out any candidates where an error occurred during processing
    const filteredCandidates = processedCandidates.filter(
      (candidate) => candidate !== null
    );

    // Sort candidates based on similarity
    const sortedCandidates = filteredCandidates.sort(
      (a, b) => b.similarity - a.similarity
    );

    res.json(sortedCandidates);
  } catch (error) {
    next(error);
  }
};

module.exports = getAIFilteredCandidates;
