const express = require('express');
const cors = require('cors');
const fs = require('fs'); // NAYA: File System module add kiya hai

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb', extended: true }));

// Data is file me save hoga taaki kabhi delete na ho
const DATA_FILE = './mql5_data.json'; 

app.get('/', (req, res) => {
    res.send("MQL5 API is Live! App ke liye /api/news use karein.");
});

app.post('/api/upload-mql5', (req, res) => {
    try {
        const data = req.body;
        // Memory ki jagah Data ko ek hard file me save kar dena
        fs.writeFileSync(DATA_FILE, JSON.stringify(data));
        console.log("MT5 se naya data receive aur SAVE hua! Total:", data.length);
        res.status(200).send("Success");
    } catch (error) {
        res.status(500).send("Error saving data");
    }
});

app.get('/api/news', (req, res) => {
    try {
        // App jab bhi data mangegi, server RAM ki jagah is File se data dega
        if (fs.existsSync(DATA_FILE)) {
            const savedData = JSON.parse(fs.readFileSync(DATA_FILE));
            res.json({
                success: true,
                source: "MQL5 Terminal (File Saved)",
                total_events: savedData.length,
                data: savedData
            });
        } else {
            // Agar file abhi tak bani nahi hai (First time)
            res.json({ success: true, source: "Waiting for MT5", total_events: 0, data: [] });
        }
    } catch (error) {
        res.status(500).json({ error: "Data read error" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
