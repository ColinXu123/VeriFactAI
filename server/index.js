const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient } = require('mongodb');

const PORT = process.env.PORT || 5006;
require('dotenv').config();

// Enable CORS - explicitly allow requests from all React dev server ports
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Origin', 'X-Requested-With'],
  credentials: true
}));

app.use(express.json());

// Health check endpoint - accessible at both root and /api/health for better compatibility
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Server is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Server is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Health check at /api path
app.get('/api', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'API server is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

const scrapeData = async (url) => {
    try {
        console.log(`[SCRAPER] Starting to scrape data from: ${url}`);
        console.time('[SCRAPER] Fetch time');
        
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            },
            timeout: 10000
        });
        
        console.timeEnd('[SCRAPER] Fetch time');
        console.log(`[SCRAPER] Got HTTP ${response.status} response`);
        
        const $ = cheerio.load(response.data);
        
        // Extract all paragraphs
        const paragraphs = [];
        $('p').each((i, el) => {
            const text = $(el).text().trim();
            if (text.length > 20) { // Skip very short paragraphs
                paragraphs.push(text);
            }
        });
        
        // Join paragraphs and limit to a reasonable size
        const article = paragraphs.join('\n\n').substring(0, 10000);
        console.log(`[SCRAPER] Extracted ${paragraphs.length} paragraphs (${article.length} chars)`);
        
        // Get the publication date
        const date = await getDate($);
        console.log(`[SCRAPER] Publication date: ${date || 'Not found'}`);
        
        // If we couldn't extract any text, return a helpful error
        if (article.length < 50) {
            console.error(`[SCRAPER] Could not extract sufficient text from ${url}`);
            throw new Error(`Could not extract sufficient text from ${url}. The site may be blocking scrapers or doesn't have readable content.`);
        }
        
        return { article, date: date || "" };
    } catch (error) {
        console.error('[SCRAPER] Error:', error.message);
        throw new Error(`Failed to scrape ${url}: ${error.message}`);
    }
};

const getDate = async ($) => {
    const metaSelectors = [
        'meta[property="article:published_time"]',
        'meta[name="publish-date"]',
        'meta[name="date"]',
        'meta[name="dcterms.created"]',
        'meta[itemprop="datePublished"]'
    ];

    for (const selector of metaSelectors) {
        const meta = $(selector);
        if (meta.length) {
            return meta.attr('content');
        }
    }
    console.log("Published date not found in meta tags.");
    return null;
}

app.get('/api/scrape', async (req, res) => {
    try {
        const url = req.query.url; // Get URL from query parameters
        if (!url) {
            return res.status(400).json({ 
                error: 'URL parameter is required',
                example: 'Use /api/scrape?url=https://example.com'
            });
        }
        
        const data = await scrapeData(url);
        res.json(data);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ 
            error: 'Failed to scrape data',
            details: error.message
        });
    }
});

const { GoogleGenerativeAI } = require("@google/generative-ai");
//const fs = require("fs");

const apiKey = process.env.API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const generationConfig = {
  temperature: 0.,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig,
  systemInstruction: "Determine the Political Bias of the following text and output in JSON format.",
});

async function run(url, article, date) {
  console.log(`[GEMINI] Starting analysis for URL: ${url}`);
  console.log(`[GEMINI] Article length: ${article.length} characters`);
  
  try {
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    const prompt = `Determine the politcal bias of the following text and output in JSON format with the following structure:
{
  "axis": {
    "progressiveConservativeBias": {
      "progressive": "0%",
      "conservative": "0%"
    },
    "authoritarianLibertarianBias": {
      "authoritarian": "0%",
      "libertarian": "0%"
    },
    "communistCapitalistBias": {
      "communist": "0%",
      "capitalist": "0%"
    }
  },
  "justification": "",
  "falseMisleadingInformation": [["Quote from the article", "Source of the fact-checked information (include the url)", "Summary"]],
  "factualTrueInformation": [["Quote from the article", "Source of the fact-checked information (include the url)", "Summary"]],
  "impartiality": "0%",
  "articleLink": ""
}

Article Link: ${url}

When determining the bias, don't just look at the text, but also look at the title and the url as well as the date, author (do research on the author), fact-checking databases, and transparency of the source.
Specifically mention false/misleading information as part of the justification, indicate the quote and the source. For the confidence in accuracy, use the fact-checking databases and the transparency of the source to determine the confidence in accuracy.
MAKE SURE YOU GET ALL FACTUAL AND MISLEADING INFORMATION FROM THE ARTICLE

${date || ''}:
${article}
`

    console.log(`[GEMINI] Sending prompt to Gemini API for ${url}...`);
    console.time('[GEMINI] Response time');
    
    const result = await chatSession.sendMessage(prompt);
    const responseText = result.response.text();
    
    console.timeEnd('[GEMINI] Response time');
    console.log(`[GEMINI] Received response of length: ${responseText.length} characters`);
    
    // Try to parse the response as JSON to validate it
    try {
      const jsonData = JSON.parse(responseText);
      console.log('[GEMINI] Successfully parsed response as JSON');
      console.log('[GEMINI] Response contains:');
      console.log(`  - Justification: ${jsonData.justification ? 'Yes' : 'No'} (${jsonData.justification ? jsonData.justification.length : 0} chars)`);
      console.log(`  - Axis data: ${jsonData.axis ? 'Yes' : 'No'}`);
      console.log(`  - Factual claims: ${jsonData.factualTrueInformation ? jsonData.factualTrueInformation.length : 0}`);
      console.log(`  - Misleading claims: ${jsonData.falseMisleadingInformation ? jsonData.falseMisleadingInformation.length : 0}`);
      console.log(`  - Impartiality score: ${jsonData.impartiality || 'Not provided'}`);
      
      // Ensure all expected fields exist
      if (!jsonData.axis || !jsonData.justification || !jsonData.impartiality) {
        console.warn('[GEMINI] Missing expected fields in response, adding defaults');
        // Add default values for missing fields
        jsonData.axis = jsonData.axis || {
          progressiveConservativeBias: { progressive: "50%", conservative: "50%" },
          authoritarianLibertarianBias: { authoritarian: "50%", libertarian: "50%" },
          communistCapitalistBias: { communist: "50%", capitalist: "50%" }
        };
        jsonData.justification = jsonData.justification || "Analysis could not determine justification.";
        jsonData.impartiality = jsonData.impartiality || "50%";
        jsonData.factualTrueInformation = jsonData.factualTrueInformation || [];
        jsonData.falseMisleadingInformation = jsonData.falseMisleadingInformation || [];
      }
      
      return jsonData;
    } catch (parseError) {
      console.error('[GEMINI] Failed to parse response as JSON:', parseError);
      console.log('[GEMINI] Raw response (first 200 chars):', responseText.substring(0, 200) + '...');
      
      // Return a structured error response
      return {
        error: true,
        message: "Failed to parse AI response as valid JSON",
        axis: {
          progressiveConservativeBias: { progressive: "50%", conservative: "50%" },
          authoritarianLibertarianBias: { authoritarian: "50%", libertarian: "50%" },
          communistCapitalistBias: { communist: "50%", capitalist: "50%" }
        },
        justification: "The analysis could not be completed due to an error processing the content.",
        factualTrueInformation: [],
        falseMisleadingInformation: [],
        impartiality: "50%",
        articleLink: url
      };
    }
  } catch (error) {
    console.error("[GEMINI] Error in run function:", error);
    
    // Return a structured error response
    return {
      error: true,
      message: `Error processing content: ${error.message}`,
      axis: {
        progressiveConservativeBias: { progressive: "50%", conservative: "50%" },
        authoritarianLibertarianBias: { authoritarian: "50%", libertarian: "50%" },
        communistCapitalistBias: { communist: "50%", capitalist: "50%" }
      },
      justification: "The analysis could not be completed due to an error processing the content.",
      factualTrueInformation: [],
      falseMisleadingInformation: [],
      impartiality: "50%",
      articleLink: url
    };
  }
}

app.get('/api/run', async (req, res) => {
    try {
        const url = req.query.url;
        if (!url) {
            return res.status(400).json({ 
                error: 'URL parameter is required',
                example: 'Use /api/run?url=https://example.com'
            });
        }
        
        // First, scrape the data
        const {article, date} = await scrapeData(url);
        console.log(`Scraped ${article.length} chars from ${url}`);
        
        // Then run the analysis
        const result = await run(url, article, date);
        result.articleLink = url; // Ensure the URL is included in the response
        
        res.json(result);
    } catch (error) {
        console.error('Error processing GET /api/run:', error);
        res.status(500).json({ 
            error: 'Failed to process request',
            details: error.message 
        });
    }
});

app.post('/api/run', async (req, res) => {
    console.log(`[API] Received POST request to /api/run`);
    
    try {
        const {url} = req.body;
        console.log(`[API] Analyzing URL: ${url}`);
        
        if (!url) {
            console.error('[API] No URL provided in request body');
            return res.status(400).json({ 
                error: 'URL parameter is required'
            });
        }
        
        // Use the local scrapeData function
        console.log(`[API] Starting web scraping for ${url}`);
        console.time('[API] Scraping time');
        const {article, date} = await scrapeData(url);
        console.timeEnd('[API] Scraping time');
        console.log(`[API] Scraped ${article.length} chars from ${url}`);
        
        // Log a snippet of the scraped content
        const snippet = article.substring(0, 100).replace(/\n/g, ' ') + '...';
        console.log(`[API] Content snippet: "${snippet}"`);
        
        console.log(`[API] Starting Gemini analysis`);
        console.time('[API] Total analysis time');
        const result = await run(url, article, date);
        console.timeEnd('[API] Total analysis time');
        
        result.articleLink = url; // Ensure the URL is included in the response
        
        console.log(`[API] Successfully completed analysis for ${url}`);
        res.json(result);
    } catch (error) {
        console.error('[API] Error processing POST /api/run:', error);
        res.status(500).json({ 
            error: 'Failed to process request',
            details: error.message 
        });
    }
});

app.listen(PORT, () => {
    console.log(`=== Server is running ===`);
    console.log(`Server URL: http://localhost:${PORT}`);
    console.log(`Health endpoints:`);
    console.log(`  - http://localhost:${PORT}/`);
    console.log(`  - http://localhost:${PORT}/api`);
    console.log(`  - http://localhost:${PORT}/api/health`);
    console.log(`API endpoints:`);
    console.log(`  - http://localhost:${PORT}/api/run (GET/POST)`);
    console.log(`  - http://localhost:${PORT}/api/scrape (GET)`);
    console.log(`======================`);
});