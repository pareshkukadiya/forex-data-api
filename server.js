const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

// NAYA: 3 saal ka data bohot bada hoga, isliye limit 50MB kar di hai
app.use(express.json({ limit: '50mb', extended: true })); 

let mql5CalendarData = []; 

app.get('/', (req, res) => {
    res.send("MQL5 API is Live! App ke liye /api/news use karein.");
});

app.post('/api/upload-mql5', (req, res) => {
    try {
        mql5CalendarData = req.body; 
        console.log("MT5 se naya bada data receive hua! Total:", mql5CalendarData.length);
        res.status(200).send("Success");
    } catch (error) {
        res.status(500).send("Error saving data");
    }
});

app.get('/api/news', (req, res) => {
    res.json({
        success: true,
        source: "MQL5 Terminal",
        total_events: mql5CalendarData.length,
        data: mql5CalendarData
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
