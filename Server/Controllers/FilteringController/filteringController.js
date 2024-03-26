// const Job = require("../../Models/JobModel");
// const Candidate = require("../../Models/Candidate");
// const natural = require("natural");
// const axios = require("axios");
// const PDFParser = require("pdf-parse");

// const getAIFilteredCandidates = async (req, res, next) => {
//   try {
//     const jobId = req.params.jobId;
//     const job = await Job.findById(jobId);

//     if (!job) {
//       return res.status(400).json({ error: "Job not found" });
//     }

//     const appliedCandidates = await Candidate.find({ jobID: jobId }).lean();
//     const jobDescription = job.job_description;

//     // Preprocess job description
//     const tokenizedJobDescription = preprocessText(jobDescription);

//     // Calculate IDF for job description
//     const idfJobDescription = calculateIDF(tokenizedJobDescription);

//     // Fetch and process resumes
//     const processedCandidates = await Promise.all(
//       appliedCandidates.map(async (candidate) => {
//         try {
//           const pdfText = await fetchPDFText(candidate.profilePic);

//           // Check if pdfText is defined
//           if (!pdfText) {
//             console.error(`Error parsing PDF for candidate ${candidate._id}: PDF text is undefined.`);
//             return null; // Skip this candidate
//           }

//           // Preprocess candidate resume
//           const tokenizedResume = preprocessText(pdfText);

//           // Compute TF for resume
//           const tfResume = calculateTF(tokenizedResume);

//           // Compute TF-IDF for resume
//           const tfidfResume = calculateTFIDF(tfResume, idfJobDescription);

//           // Calculate similarity between job description and resume
//           const similarity = calculateSimilarity(tfidfResume, idfJobDescription);

//           return { similarity, ...candidate };
//         } catch (error) {
//           console.error(`Error processing candidate: ${error.message}`);
//           return null; // Handle error gracefully
//         }
//       })
//     );

//     // Filter out any candidates where an error occurred during processing
//     const filteredCandidates = processedCandidates.filter(
//       (candidate) => candidate !== null
//     );

//     // Sort candidates based on similarity
//     const sortedCandidates = filteredCandidates.sort(
//       (a, b) => b.similarity - a.similarity
//     );

//     res.status(200).json(sortedCandidates);
//   } catch (error) {
//     next(error);
//   }
// };

// // Function to preprocess text
// function preprocessText(text) {
//   // Tokenize text
//   const tokenizedText = new natural.WordTokenizer().tokenize(text.toLowerCase());
//   // You can add additional preprocessing steps here like removing stopwords, punctuation, etc.
//   return tokenizedText;
// }

// // Function to calculate Term Frequency (TF)
// function calculateTF(tokens) {
//   const tf = {};
//   const totalTerms = tokens.length;
//   tokens.forEach((term) => {
//     tf[term] = (tf[term] || 0) + 1 / totalTerms;
//   });
//   return tf;
// }

// // Function to calculate Inverse Document Frequency (IDF)
// function calculateIDF(tokens) {
//   const idf = {};
//   const totalDocuments = 1; // Since we're only considering one document (job description)
//   tokens.forEach((term) => {
//     idf[term] = idf[term] || 0;
//     idf[term]++;
//   });
//   return idf;
// }

// // Function to calculate TF-IDF
// function calculateTFIDF(tf, idf) {
//   const tfidf = {};
//   for (const term in tf) {
//     if (idf.hasOwnProperty(term)) {
//       tfidf[term] = tf[term] * Math.log(1 / idf[term]);
//     }
//   }
//   return tfidf;
// }

// // Function to calculate similarity between two documents using cosine similarity
// // function calculateSimilarity(tfidf1, tfidf2) {
// //   let dotProduct = 0;
// //   let mag1 = 0;
// //   let mag2 = 0;
// //   for (const term in tfidf1) {
// //     dotProduct += tfidf1[term] * (tfidf2[term] || 0);
// //     mag1 += Math.pow(tfidf1[term], 2);
// //   }
// //   for (const term in tfidf2) {
// //     mag2 += Math.pow(tfidf2[term], 2);
// //   }
// //   const magnitude = Math.sqrt(mag1) * Math.sqrt(mag2);
// //   return magnitude === 0 ? 0 : dotProduct / magnitude;
// // }

// function calculateSimilarity(tfidf1, tfidf2) {
//   let dotProduct = 0;
//   let mag1 = 0;
//   let mag2 = 0;
//   const allTerms = new Set([...Object.keys(tfidf1), ...Object.keys(tfidf2)]);

//   for (const term of allTerms) {
//     const value1 = tfidf1[term] || 0;
//     const value2 = tfidf2[term] || 0;
//     dotProduct += value1 * value2;
//     mag1 += value1 ** 2;
//     mag2 += value2 ** 2;
//   }

//   const magnitude = Math.sqrt(mag1) * Math.sqrt(mag2);
//   return magnitude === 0 ? 0 : dotProduct / magnitude;
// }

// async function fetchPDFText(url) {
//   try {
//     const response = await axios.get(url, { responseType: "arraybuffer" });
//     const pdfBuffer = Buffer.from(response.data);
//     const data = await PDFParser(pdfBuffer);
//     return data.text;
//   } catch (error) {
//     console.error('Error fetching or parsing PDF:', error);
//     return null;
//   }
// }

// module.exports = getAIFilteredCandidates;


const Job = require("../../Models/JobModel");
const Candidate = require("../../Models/Candidate");
const natural = require("natural");
const axios = require("axios");
const PDFParser = require("pdf-parse");

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
    const filteredCandidates = processedCandidates.filter(
      (candidate) => candidate !== null
    );

    // Sort candidates based on similarity
    const sortedCandidates = filteredCandidates.toSorted(
      (a, b) => b.similarity - a.similarity
    );

    res.status(200).json(sortedCandidates);
  } catch (error) {
    next(error);
  }
};

// Function to preprocess text
function preprocessText(text) {
  // Tokenize text
  const tokenizedText = new natural.WordTokenizer().tokenize(text);
  // You can add additional preprocessing steps here like removing stopwords, punctuation, etc.
  return tokenizedText;
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
function calculateTFIDF(tf, idf) {
  const tfidf = {};
  for (const term in tf) {
    if (idf.hasOwnProperty(term)) {
      tfidf[term] = tf[term] * idf[term];
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
  return magnitude === 0 ? 0 : dotProduct / magnitude;
}

// async function fetchPDFText(url) {
//   try {
//     const response = await axios.get(url, { responseType: "arraybuffer" });
//     const pdfBuffer = Buffer.from(response.data);
//     const data = await PDFParser(pdfBuffer);

//     const words = text.replace(/[^a-zA-Z\s]/g, ' ') // Replace non-alphanumeric characters with spaces
//       .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
//       .trim() // Remove leading/trailing spaces
//       .split(' ')
//     console.log("words", words)
//     return words;
//   } catch (error) {
//     console.error('Error fetching or parsing PDF:', error);
//     return null;
//   }
// }

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

function testSimilarity() {
  const jobDescription = "machine learning engineer job description";
  const resume1 = "i am a software engineer with experience in python and machine learning";
  const resume2 = "data scientist with expertise in machine learning algorithms and deep learning models";
  const resume3 = "machine learning engineer job description";

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