const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// Mobile app ko API access karne ki permission deta hai
app.use(cors()); 

// Basic check karne ke liye URL
app.get('/', (req, res) => {
    res.send("Forex API is Live! Data ke liye /api/news par jayein.");
});

// Main API jahan se JSON data aayega
app.get('/api/news', async (req, res) => {
    try {
        const url = 'https://nfs.faireconomy.media/ff_calendar_thisweek.json';
        
        // Browser ban kar request bhejenge taaki block na ho
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json',
                'Referer': 'https://www.forexfactory.com/'
            }
        });
        
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ 
            error: "Data load nahi ho paaya", 
            details: error.message 
        });
    }
});

// Render cloud ke liye port setup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
