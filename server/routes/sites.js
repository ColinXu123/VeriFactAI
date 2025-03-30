const express = require('express');
const router = express.Router();
const Site = require('../models/Site');
const Claim = require('../models/Claim');

// Helper function to validate URL format
function isValidUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch (error) {
    return false;
  }
}

// Simple URL normalization
function normalizeUrl(url) {
  let normalizedUrl = url.trim();
  
  // Add https:// if no protocol is specified
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = 'https://' + normalizedUrl;
  }
  
  // Remove trailing slash if present
  if (normalizedUrl.endsWith('/')) {
    normalizedUrl = normalizedUrl.slice(0, -1);
  }
  
  return normalizedUrl;
}

// Calculate trust score based on ratio of factual to total claims
async function calculateTrustScore() {
  try {
    const factualClaimsCount = await Claim.countDocuments({ isFactual: true });
    const totalClaimsCount = await Claim.countDocuments();
    
    if (totalClaimsCount === 0) return 50; // Default score if no claims exist
    
    const ratio = factualClaimsCount / totalClaimsCount;
    const score = Math.round(ratio * 100);
    
    return score;
  } catch (error) {
    console.error('Error calculating trust score:', error);
    return 50; // Default score on error
  }
}

// Validate a URL
router.get('/validate', async (req, res) => {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({
      valid: false,
      message: 'URL parameter is required'
    });
  }
  
  // Normalize then validate the URL
  let normalizedUrl = url;
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = 'https://' + normalizedUrl;
  }
  
  const isValid = isValidUrl(normalizedUrl);
  
  return res.json({
    valid: isValid,
    message: isValid ? 'Valid URL format' : 'Invalid URL format'
  });
});

// Get all sites
router.get('/', async (req, res) => {
  try {
    const sites = await Site.find();
    res.json(sites);
  } catch (error) {
    console.error('Error retrieving sites:', error);
    res.status(500).json({
      error: 'An error occurred while retrieving sites'
    });
  }
});

// Check if a site is reputable
router.get('/check', async (req, res) => {
  try {
    let { url } = req.query;
    
    if (!url) {
      return res.status(400).json({
        error: 'URL parameter is required'
      });
    }
    
    // Normalize the URL
    url = normalizeUrl(url);
    
    // Validate the URL
    if (!isValidUrl(url)) {
      return res.status(400).json({
        error: 'Invalid URL format'
      });
    }

    // Check if this site has been checked before
    let site = await Site.findOne({ url });
    
    if (site) {
      // Recalculate the score based on current claims ratio
      const score = await calculateTrustScore();
      const isReputable = score > 70;
      
      // Update the site's score
      site.domainScore = score;
      site.isReputable = isReputable;
      await site.save();
      
      return res.json({
        url: site.url,
        isReputable: site.isReputable,
        domainScore: site.domainScore,
        lastChecked: new Date()
      });
    }
    
    // Calculate trust score based on factual claims ratio
    const score = await calculateTrustScore();
    const isReputable = score > 70;
    
    // Save the result
    try {
      site = new Site({
        url,
        isReputable,
        domainScore: score
      });
      
      await site.save();
    } catch (saveError) {
      console.error('Error saving site:', saveError);
      // Continue even if saving fails
    }
    
    return res.json({
      url,
      isReputable,
      domainScore: score,
      lastChecked: new Date()
    });
    
  } catch (error) {
    console.error('Error checking site:', error);
    res.status(500).json({
      error: 'An error occurred while checking the site'
    });
  }
});

// Add a site
router.post('/', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        error: 'URL is required'
      });
    }
    
    const normalizedUrl = normalizeUrl(url);
    
    // Validate the URL
    if (!isValidUrl(normalizedUrl)) {
      return res.status(400).json({
        error: 'Invalid URL format'
      });
    }
    
    // Check if site already exists
    const existingSite = await Site.findOne({ url: normalizedUrl });
    if (existingSite) {
      return res.status(400).json({
        error: 'This site is already in the database'
      });
    }
    
    // Calculate trust score
    const score = await calculateTrustScore();
    const isReputable = score > 70;
    
    // Create new site
    const newSite = new Site({
      url: normalizedUrl,
      isReputable,
      domainScore: score
    });
    
    await newSite.save();
    res.status(201).json(newSite);
  } catch (error) {
    console.error('Error adding site:', error);
    res.status(500).json({
      error: 'An error occurred while adding the site'
    });
  }
});

// Delete a site
router.delete('/:id', async (req, res) => {
  try {
    const site = await Site.findByIdAndDelete(req.params.id);
    
    if (!site) {
      return res.status(404).json({
        error: 'Site not found'
      });
    }
    
    res.json({ message: 'Site deleted successfully' });
  } catch (error) {
    console.error('Error deleting site:', error);
    res.status(500).json({
      error: 'An error occurred while deleting the site'
    });
  }
});

module.exports = router; 