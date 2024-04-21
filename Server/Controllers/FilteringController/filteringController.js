const Job = require("../../Models/JobModel");
const Candidate = require("../../Models/Candidate");
const natural = require("natural");
const axios = require("axios");
const PDFParser = require("pdf-parse");
const stopword = require('stopword');

/**
 * Retrieves and processes candidates for a specific job based on job description and candidate resumes.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next function in the middleware chain.
 * @return {Object} The sorted and filtered list of candidates.
 */
const getAIFilteredCandidates = async (req, res, next) => {
  try {
    const jobId = req.params.jobId;
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(400).json({ error: "Job not found" });
    }

    const appliedCandidates = await Candidate.find({ jobID: jobId }).lean();
    const jobDescription = job.job_description;

    // Preprocess job description
    const tokenizedJobDescription = preprocessText(jobDescription);

    // Calculate IDF for job description
    const idfJobDescription = calculateIDF(tokenizedJobDescription);

    // Fetch and process resumes
    const processedCandidates = await Promise.all(
      appliedCandidates.map(async (candidate) => {
        try {
          const pdfText = await fetchPDFText(candidate.profilePic);

          // Check if pdfText is defined
          if (!pdfText) {
            console.error(`Error parsing PDF for candidate ${candidate._id}: PDF text is undefined.`);
            return null; // Skip this candidate
          }

          // Preprocess candidate resume
          const tokenizedResume = preprocessText(pdfText);

          // Compute TF for resume
          const tfResume = calculateTF(tokenizedResume);

          // Compute TF-IDF for resume
          const tfidfResume = calculateTFIDF(tfResume, idfJobDescription);
          console.log("TF-IDF of resume:", tfidfResume);

          // Calculate similarity between job description and resume
          const similarity = calculateSimilarity(tfidfResume, tokenizedJobDescription, idfJobDescription);

          return { similarity, ...candidate };
        } catch (error) {
          console.error(`Error processing candidate: ${error.message}`);
          return null; // Handle error gracefully
        }
      })
    );

    // Filter out any candidates where an error occurred during processing
    let filteredCandidates = processedCandidates.filter(
      (candidate) => candidate !== null
    );

    // Sort candidates based on similarity
    let sortedCandidates = filteredCandidates.toSorted(
      (a, b) => b.similarity - a.similarity
    );

    // add a good fit property if the candidate has a similarity score above 0.5
   const  goodFitSortedCandidates = sortedCandidates.map((candidate) => {
      if (candidate.similarity > 0.5) {
        return { goodFit: true, ...candidate };
      } else {
        return { ...candidate, goodFit: false };
      }
    })

    console.log("Sorted candidates:", goodFitSortedCandidates);
    res.status(200).json(goodFitSortedCandidates);
  } catch (error) {
    next(error);
  }
};

// Function to preprocess text
function preprocessText(text) {
  // Tokenize text using natural library's preprocessing steps here like removing stopwords, punctuation, etc.
  const tokenizedText = new natural.WordTokenizer().tokenize(text)
  const stopwordRemoval = stopword.removeStopwords(tokenizedText);
  
  //  lowercase the text
 const processedText = stopwordRemoval.map((word) => word.toLowerCase());
  return processedText;
}

// Function to calculate Term Frequency (TF)
function calculateTF(tokens) {
  const tf = {};
  const totalTerms = tokens.length;
  tokens.forEach((term) => {
    tf[term] = (tf[term] || 0) + 1 / totalTerms;
  });
  return tf;
}

// Function to calculate Inverse Document Frequency (IDF)
function calculateIDF(tokens) {
  const idf = {};
  const totalDocuments = 1; // Since we're only considering one document (job description)
  const uniqueTokens = new Set(tokens);
  uniqueTokens.forEach((term) => {
    idf[term] = Math.log(totalDocuments / (1 + (tokens.filter(t => t === term).length)));
  });
  return idf;
}

// Function to calculate TF-IDF
// function calculateTFIDF(tf, idf) {
//   const tfidf = {};
//   for (const term in tf) {
//     if (idf.hasOwnProperty(term)) {
//       tfidf[term] = tf[term] * idf[term];
//     }
//   }
//   return tfidf;
// }

function calculateTFIDF(tf, idf) {
  const tfidf = {};
  for (const term in tf) {
    if (idf.hasOwnProperty(term)) {
      tfidf[term] = Math.abs(tf[term] * idf[term]);
    }
  }
  return tfidf;
}


// Function to calculate similarity between two documents using cosine similarity
function calculateSimilarity(tfidf1, tokens2, idf2) {
  let dotProduct = 0;
  let mag1 = 0;
  let mag2 = 0;
  const allTerms = new Set([...Object.keys(tfidf1), ...tokens2]);

  for (const term of allTerms) {
    const value1 = tfidf1[term] || 0;
    const value2 = (idf2[term] || 0) * (tokens2.filter(t => t === term).length / tokens2.length);
    dotProduct += value1 * value2;
    mag1 += value1 ** 2;
    mag2 += value2 ** 2;
  }

  const magnitude = Math.sqrt(mag1) * Math.sqrt(mag2);
  const result = magnitude === 0 ? 0 : dotProduct / magnitude;

  return Math.abs(result);
}

/**
 * Asynchronously fetches the text content of a PDF file from the given URL.
 *
 * @param {string} url - The URL of the PDF file.
 * @return {Promise<string|null>} A promise that resolves with the text content of the PDF file, or null if an error occurred.
 */
async function fetchPDFText(url) {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const pdfBuffer = Buffer.from(response.data);
    const data = await PDFParser(pdfBuffer);
    let text = data.text;

    return text;
  } catch (error) {
    console.error('Error fetching or parsing PDF:', error);
    return null;
  }
}

/**
 * Calculates the similarity between job descriptions and resumes.
 *
 * @return {void}
 */
function testSimilarity() {
  const jobDescription = "Machine learning Engineer job description";
  const resume1 = "i am a software engineer with experience in python and machine learning";
  const resume2 = "data scientist with expertise in machine learning algorithms and deep learning models";
  const resume3 = "Machine Learning engineer job description";

  const tokenizedJobDescription = preprocessText(jobDescription);
  const idfJobDescription = calculateIDF(tokenizedJobDescription);

  const tokenizedResume1 = preprocessText(resume1);
  const tokenizedResume2 = preprocessText(resume2);
  const tokenizedResume3 = preprocessText(resume3);

  const tfResume1 = calculateTF(tokenizedResume1);
  const tfResume2 = calculateTF(tokenizedResume2);
  const tfResume3 = calculateTF(tokenizedResume3);
  // console.log("TF of resume1:", tfResume1);
  // console.log("TF of resume2:", tfResume2);
  // console.log("TF of resume3:", tfResume3);
  const tfidfResume1 = calculateTFIDF(tfResume1, idfJobDescription);
  const tfidfResume2 = calculateTFIDF(tfResume2, idfJobDescription);
  const tfidfResume3 = calculateTFIDF(tfResume3, idfJobDescription);
  // console.log("resume 3 : ", resume3)
  // console.log("resume 2 :", resume2)
  // console.log("job description: ", jobDescription);
  // console.log("tfidf of resume3: ", tfidfResume3);
  // console.log("tfidf of resume2: ", tfidfResume2);
  // console.log("tfidf of resume3: ", tfidfResume3);

  // console.log("TF-IDF of resume1:", tfidfResume1);
  const similarity1 = calculateSimilarity(tfidfResume1, tokenizedJobDescription, idfJobDescription);
  const similarity2 = calculateSimilarity(tfidfResume2, tokenizedJobDescription, idfJobDescription);
  const similarity3 = calculateSimilarity(tfidfResume3, tokenizedJobDescription, idfJobDescription);

  console.log("Similarity between resume1 and job description:", similarity1);
  console.log("Similarity between resume2 and job description:", similarity2);
  console.log("Similarity between resume3 and job description:", similarity3);
}

testSimilarity();

module.exports = getAIFilteredCandidates;