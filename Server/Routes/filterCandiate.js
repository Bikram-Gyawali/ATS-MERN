const express = require("express");
const getAIFilteredCandidates = require("../Controllers/FilteringController/filteringController");

const CandidateFilter = express.Router();

CandidateFilter.post("/filter-candiates", getAIFilteredCandidates);

module.exports = CandidateFilter;
