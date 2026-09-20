const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/', (req, res) => {
    res.send("Scraping API is Live! Use /api/scrape?month=sep.2026 for data.");
});

// Scraping API Endpoint
app.get('/api/scrape', async (req, res) => {
    try {
        // Agar aap month nahi daalenge toh by default 'this' month lega
        const month = req.query.month || 'this';
        const targetUrl = `https://www.forexfactory.com/calendar?month=${month}`;

        // Cloudflare ko bypass karne ke liye strong headers
        const response = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            }
        });

        // Cheerio se HTML load karna
        const $ = cheerio.load(response.data);
        let newsData = [];

        // Table ke har row me loop chalana
        $('.calendar__row').each((index, element) => {
            const title = $(element).find('.calendar__event').text().trim();
            const currency = $(element).find('.calendar__currency').text().trim();
            
            // Impact color nikalna
            let impact = 'Low';
            if ($(element).find('.icon--ff-impact-red').length > 0) impact = 'High';
            else if ($(element).find('.icon--ff-impact-ora').length > 0) impact = 'Medium';
            else if ($(element).find('.icon--ff-impact-yel').length > 0) impact = 'Low';

            // Agar title hai tabhi list me add karo
            if (title) {
                newsData.push({
                    title: title,
                    currency: currency,
                    impact: impact
                });
            }
        });

        res.json({
            success: true,
            source: targetUrl,
            total_events: newsData.length,
            data: newsData
        });

    } catch (error) {
        // Agar Cloudflare block karega toh yeh error aayega
        res.status(500).json({ 
            error: "Scraping fail ho gayi ya IP block ho gayi", 
            details: error.message 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
