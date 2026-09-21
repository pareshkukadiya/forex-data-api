const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
// MT5 se aane wale JSON data ko read karne ke liye
app.use(express.json()); 

// Yahan MT5 ka data save hoga
let mql5CalendarData = []; 

app.get('/', (req, res) => {
    res.send("MQL5 API is Live! App ke liye /api/news use karein.");
});

// MT5 is link par data bhejega (POST request)
app.post('/api/upload-mql5', (req, res) => {
    try {
        mql5CalendarData = req.body; // MT5 se aaya naya data save kar liya
        console.log("MT5 se naya data receive hua!");
        res.status(200).send("Success");
    } catch (error) {
        res.status(500).send("Error saving data");
    }
});

// Mobile App is link se data legi (GET request)
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
