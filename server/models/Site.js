const mongoose = require('mongoose');

const SiteSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  isReputable: {
    type: Boolean,
    default: null
  },
  skepticalClaims: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Claim'
  }],
  factualClaims: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Claim'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastChecked: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Site', SiteSchema); 