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

// API endpoint to handle product search
app.get('/api/search', (req, res) => {
  const query = req.query.q?.toLowerCase() || '';
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(query)
  );
  res.json(filteredProducts);
});

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
        size: null,
        color: null,
        text: null,
      };
    }

    const context = customizationContext[req.sessionID];
    let botReply = '';

    // Chatbot flow logic
    if (!context.product) {
      if (message.toLowerCase().includes("mug")) {
        context.product = "mug";
        botReply = "What size would you like for the mug?";
      } else if (message.toLowerCase().includes("t-shirt")) {
        context.product = "t-shirt";
        botReply = "What size would you like for the t-shirt?";
      } else if (message.toLowerCase().includes("keychain")) {
        context.product = "keychain";
        botReply = "What size would you like for the keychain?";
      } else {
        botReply = "Which product would you like to customize (e.g., mug, t-shirt, keychain)?";
      }
    } else if (!context.size) {
      if (message.toLowerCase().includes("large")) {
        context.size = "large";
        botReply = `What color would you like for the ${context.product}?`;
      } else if (message.toLowerCase().includes("medium")) {
        context.size = "medium";
        botReply = `What color would you like for the ${context.product}?`;
      } else if (message.toLowerCase().includes("small")) {
        context.size = "small";
        botReply = `What color would you like for the ${context.product}?`;
      } else {
        botReply = `What size would you like for the ${context.product}? (large, medium, small)`;
      }
    } else if (!context.color) {
      if (message.toLowerCase().includes("white")) {
        context.color = "white";
        botReply = `What text would you like to add to the ${context.product}?`;
      } else if (message.toLowerCase().includes("blue")) {
        context.color = "blue";
        botReply = `What text would you like to add to the ${context.product}?`;
      } else if (message.toLowerCase().includes("red")) {
        context.color = "red";
        botReply = `What text would you like to add to the ${context.product}?`;
      } else {
        botReply = `What color would you like for the ${context.product}? (white, blue, red)`;
      }
    } else if (!context.text) {
      context.text = message; // Capture the text input
      botReply = `You’ve chosen a ${context.size} ${context.color} ${context.product} with the text "${context.text}". Let me know if you'd like to make any changes!`;
    } else {
      botReply = `You’ve already chosen a ${context.size} ${context.color} ${context.product} with the text "${context.text}". Let me know if you'd like to make any changes!`;
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
