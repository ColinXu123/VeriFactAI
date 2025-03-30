const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// Import routes
const sitesRouter = require('./routes/sites');
const claimsRouter = require('./routes/claims');

// Use routes
app.use('/api/sites', sitesRouter);
app.use('/api/claims', claimsRouter);

// Basic route for testing
app.get('/', (req, res) => {
  res.send('VeriFact API is running!');
});

// Set port
const PORT = process.env.PORT || 1212;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 