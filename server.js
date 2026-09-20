const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/', (req, res) => {
    res.send("Puppeteer API is Live! Use /api/scrape?month=sep.2026");
});

app.get('/api/scrape', async (req, res) => {
    try {
        const month = req.query.month || 'this';
        const targetUrl = `https://www.forexfactory.com/calendar?month=${month}`;

        // Asli Chrome browser start karna
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'], // Render cloud ke liye zaroori
            headless: true 
        });

        const page = await browser.newPage();
        
        // Cloudflare ko dhoka dene ke liye User Agent set karna
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // Page load hone tak wait karna
        await page.goto(targetUrl, { waitUntil: 'networkidle2' });

        // Page ke andar se data nikalna
        const newsData = await page.evaluate(() => {
            const rows = document.querySelectorAll('.calendar__row');
            const data = [];

            rows.forEach(row => {
                const titleElement = row.querySelector('.calendar__event');
                const currencyElement = row.querySelector('.calendar__currency');
                
                if (titleElement) {
                    const title = titleElement.innerText.trim();
                    const currency = currencyElement ? currencyElement.innerText.trim() : '';
                    
                    let impact = 'Low';
                    if (row.querySelector('.icon--ff-impact-red')) impact = 'High';
                    else if (row.querySelector('.icon--ff-impact-ora')) impact = 'Medium';
                    else if (row.querySelector('.icon--ff-impact-yel')) impact = 'Low';

                    if(title) {
                        data.push({ title, currency, impact });
                    }
                }
            });
            return data;
        });

        await browser.close();

        res.json({
            success: true,
            month: month,
            total_events: newsData.length,
            data: newsData
        });

    } catch (error) {
        res.status(500).json({ 
            error: "Puppeteer scraping fail ho gayi", 
            details: error.message 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
