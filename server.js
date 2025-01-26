require('dotenv').config();
const express = require('express');
const path = require('path');
const { OpenAI } = require('openai');
const session = require('express-session'); // For tracking user sessions

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize OpenAI with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files
app.use(express.json()); // Parse JSON bodies
app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
  })
);

// Mock product data (can be replaced with a database in the future)
const products = [
  { id: 1, name: 'Personalized Mug', image: '/images/mug.png' },
  { id: 2, name: 'Custom T-Shirt', image: '/images/tshirt.png' },
  { id: 3, name: 'Engraved Keychain', image: '/images/keychain.png' },
];

// Context object to track user choices
const customizationContext = {};

// Chatbot endpoint
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    // Initialize session-based context for each user
    if (!customizationContext[req.sessionID]) {
      customizationContext[req.sessionID] = {
        product: null,
        text: null,
      };
    }

    const context = customizationContext[req.sessionID];
    let botReply = '';

    // Simplified chatbot logic
    if (!context.product) {
      if (message.toLowerCase().includes('mug') || context.product === 'mug') {
        context.product = 'mug';
        botReply = 'What name or text would you like to add to the mug?';
      } else if (message.toLowerCase().includes('t-shirt')) {
        context.product = 't-shirt';
        botReply = 'What name or text would you like to add to the t-shirt?';
      } else if (message.toLowerCase().includes('keychain')) {
        context.product = 'keychain';
        botReply = 'What name or text would you like to add to the keychain?';
      } else {
        botReply = 'Which product would you like to customize? (e.g., mug, t-shirt, keychain)';
      }
    } else if (!context.text) {
      context.text = message.trim(); // Update the context with the provided text
      botReply = `You’ve chosen to personalize a ${context.product} with the text "${context.text}". Let me know if you'd like to make any changes!`;
    } else {
      botReply = `You’ve already chosen to personalize a ${context.product} with the text "${context.text}". Let me know if you'd like to make any changes!`;
    }

    res.json({ reply: botReply });
  } catch (error) {
    console.error('Error connecting to OpenAI:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch response from OpenAI' });
  }
});

// Root route to serve the homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
