const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const cors = require('cors');

// Stealth mode ON taaki Cloudflare Captcha na maange
puppeteer.use(StealthPlugin());

const app = express();
app.use(cors());

app.get('/', (req, res) => {
    res.send("Stealth Puppeteer API is Live! Use /api/scrape?month=sep.2026");
});

app.get('/api/scrape', async (req, res) => {
    let browser = null;
    try {
        const month = req.query.month || 'this';
        const targetUrl = `https://www.forexfactory.com/calendar?month=${month}`;

        browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled'],
            headless: true 
        });

        const page = await browser.newPage();
        
        // Asli browser jaisa behave karne ke liye
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1366, height: 768 });

        await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 30000 });

        // Wait karo jab tak calendar load na ho jaye (ya 5 second)
        try {
            await page.waitForSelector('.calendar__row', { timeout: 5000 });
        } catch (e) {
            console.log("Calendar rows load nahi hui, shayaad abhi bhi Captcha hai.");
        }

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
        if (browser) await browser.close();
        res.status(500).json({ 
            error: "Scraping me error aaya", 
            details: error.message 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
