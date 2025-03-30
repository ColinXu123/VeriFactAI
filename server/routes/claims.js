const express = require('express');
const router = express.Router();
const Claim = require('../models/Claim');

// Get all claims
router.get('/', async (req, res) => {
  try {
    // Filter by isFactual if provided
    const filter = {};
    if (req.query.isFactual !== undefined) {
      filter.isFactual = req.query.isFactual === 'true';
    }
    
    const claims = await Claim.find(filter).sort({ createdAt: -1 });
    res.json(claims);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get factual claims
router.get('/factual', async (req, res) => {
  try {
    const claims = await Claim.find({ isFactual: true }).sort({ createdAt: -1 });
    res.json(claims);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get skeptical claims
router.get('/skeptical', async (req, res) => {
  try {
    const claims = await Claim.find({ isFactual: false }).sort({ createdAt: -1 });
    res.json(claims);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get one claim
router.get('/:id', async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }
    res.json(claim);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new claim
router.post('/', async (req, res) => {
  const claim = new Claim({
    text: req.body.text,
    highlight: req.body.highlight,
    info: req.body.info,
    explanation: req.body.explanation,
    isFactual: req.body.isFactual
  });
  
  try {
    const newClaim = await claim.save();
    res.status(201).json(newClaim);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a claim
router.patch('/:id', async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);
    
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }
    
    if (req.body.text) claim.text = req.body.text;
    if (req.body.highlight) claim.highlight = req.body.highlight;
    if (req.body.info) claim.info = req.body.info;
    if (req.body.explanation) claim.explanation = req.body.explanation;
    if (req.body.isFactual !== undefined) claim.isFactual = req.body.isFactual;
    
    const updatedClaim = await claim.save();
    res.json(updatedClaim);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a claim
router.delete('/:id', async (req, res) => {
  try {
    const result = await Claim.deleteOne({ _id: req.params.id });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Claim not found' });
    }
    
    res.json({ message: 'Claim deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 