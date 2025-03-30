const mongoose = require('mongoose');

const ClaimSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  highlight: {
    type: String,
    required: true,
    trim: true
  },
  info: {
    type: String,
    required: true,
    trim: true
  },
  explanation: {
    type: String,
    trim: true
  },
  isFactual: {
    type: Boolean,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Claim', ClaimSchema); 